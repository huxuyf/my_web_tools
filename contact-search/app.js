// IndexedDB 数据库初始化
const db = new Dexie('ContactSearchDB');

// 定义数据库结构
db.version(1).stores({
    contacts: '++id, name, email, phone, shortPhone, employeeId, department'
});

// HTML 转义：Excel 数据属于外部输入，任何拼入页面 HTML 的值都必须先转义（防 XSS 与结构破坏）
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

// 字段映射配置
const fieldMapping = {
    '部门名称': 'department',
    '姓名': 'name',
    '邮箱': 'email',
    '手机': 'phone',
    '短号': 'shortPhone',
    '职位': 'position',
    '性别': 'gender',
    '工号': 'employeeId',
    '入职时间': 'hireDate',
    '详细部门': 'detailDepartment',
    '公司': 'company'
};

// 暂存发现重复时的待导入数据，供"跳过重复项并导入其余"使用
let pendingImport = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 检查是否有数据，决定是否显示空状态
    try {
        const count = await db.contacts.count();
        const emptyState = document.getElementById('emptyState');
        if (count > 0) {
            emptyState.style.display = 'none';
        } else {
            emptyState.style.display = 'block';
        }
    } catch (error) {
        console.error('检查数据状态错误:', error);
    }
});

// 触发文件选择
function triggerFileInput() {
    document.getElementById('fileInput').click();
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 验证文件类型
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    const fileExtension = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');

    if (!validTypes.includes(file.type) && !fileExtension) {
        showImportResult(false, '文件格式错误', '请选择有效的Excel文件（.xlsx 或 .xls）', { success: 0, failed: 0, duplicates: [] });
        return;
    }

    // 验证文件大小（50MB限制）
    if (file.size > 50 * 1024 * 1024) {
        const proceed = confirm('文件大小超过50MB，导入可能会较慢，是否继续？');
        if (!proceed) {
            event.target.value = '';
            return;
        }
    }

    // 开始导入
    importExcelFile(file);
    event.target.value = '';
}

// 导入Excel文件
async function importExcelFile(file) {
    // 显示进度对话框
    showModal('progressModal');
    updateProgress('正在读取文件...', 10);

    try {
        const reader = new FileReader();

        reader.onload = async function(e) {
            try {
                updateProgress('正在解析Excel数据...', 30);

                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // 获取第一个工作表
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // 转换为JSON数据
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (!jsonData || jsonData.length < 2) {
                    throw new Error('Excel文件中没有数据或格式不正确');
                }

                // 解析表头和数据
                const headers = jsonData[0];
                const rows = jsonData.slice(1);

                updateProgress(`正在处理 ${rows.length} 条记录...`, 50);

                // 验证必需字段：只强制要求搜索功能实际依赖的列，其余列存在才导入
                const requiredFields = ['姓名', '手机'];
                const missingFields = requiredFields.filter(field => !headers.includes(field));

                if (missingFields.length > 0) {
                    throw new Error(`Excel文件缺少以下必需字段：${missingFields.join(', ')}`);
                }

                // 转换数据格式
                const contacts = [];
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    const contact = {};

                    // 映射字段
                    for (const [chineseField, englishField] of Object.entries(fieldMapping)) {
                        const columnIndex = headers.indexOf(chineseField);
                        if (columnIndex !== -1 && row[columnIndex] !== undefined) {
                            contact[englishField] = String(row[columnIndex]).trim();
                        } else {
                            contact[englishField] = '';
                        }
                    }

                    contacts.push(contact);

                    // 更新进度
                    if (i % 100 === 0) {
                        updateProgress(`正在处理第 ${i + 1} / ${rows.length} 条记录...`, 50 + (i / rows.length) * 30);
                    }
                }

                updateProgress('正在检查重复数据...', 80);

                // 查重范围：① 与库内已有数据重复 ② 本次文件内部重复
                // 用 Map/Set 做 O(1) 查找，避免对每条记录全量扫描
                const duplicates = [];
                const duplicateIndexes = new Set();
                const existingContacts = await db.contacts.toArray();
                const existingEmpMap = new Map(
                    existingContacts.filter(c => c.employeeId).map(c => [c.employeeId, c.name])
                );
                const existingEmailMap = new Map(
                    existingContacts.filter(c => c.email).map(c => [c.email, c.name])
                );
                const seenEmployeeIds = new Set();
                const seenEmails = new Set();

                contacts.forEach((contact, idx) => {
                    let dup = null;

                    if (contact.employeeId) {
                        if (existingEmpMap.has(contact.employeeId)) {
                            dup = { type: '工号（库内已存在）', value: contact.employeeId, name: contact.name, existingName: existingEmpMap.get(contact.employeeId) || '' };
                        } else if (seenEmployeeIds.has(contact.employeeId)) {
                            dup = { type: '工号（文件内重复）', value: contact.employeeId, name: contact.name, existingName: '' };
                        }
                        seenEmployeeIds.add(contact.employeeId);
                    }

                    if (!dup && contact.email) {
                        if (existingEmailMap.has(contact.email)) {
                            dup = { type: '邮箱（库内已存在）', value: contact.email, name: contact.name, existingName: existingEmailMap.get(contact.email) || '' };
                        } else if (seenEmails.has(contact.email)) {
                            dup = { type: '邮箱（文件内重复）', value: contact.email, name: contact.name, existingName: '' };
                        }
                    }
                    if (contact.email) {
                        seenEmails.add(contact.email);
                    }

                    if (dup) {
                        duplicates.push(dup);
                        duplicateIndexes.add(idx);
                    }
                });

                if (duplicates.length > 0) {
                    // 暂存待导入数据，由用户在弹窗中选择"全部放弃"或"跳过重复项导入其余"
                    pendingImport = { contacts, duplicateIndexes };
                    showDuplicateModal(duplicates);
                    closeModal('progressModal');
                    return;
                }

                updateProgress('正在保存数据...', 90);

                // 清除旧数据并保存新数据
                await db.contacts.clear();
                await db.contacts.bulkAdd(contacts);

                updateProgress('导入完成！', 100);

                // 隐藏空状态
                document.getElementById('emptyState').style.display = 'none';

                // 显示导入结果
                setTimeout(() => {
                    closeModal('progressModal');
                    showImportResult(true, '导入成功', '数据已成功导入到本地数据库', {
                        success: contacts.length,
                        failed: 0,
                        duplicates: []
                    });
                    // updateTotalCount(); // 统计信息已移除
                    clearResults();
                }, 500);

            } catch (error) {
                console.error('导入错误:', error);
                closeModal('progressModal');
                showImportResult(false, '导入失败', error.message, { success: 0, failed: 0, duplicates: [] });
            }
        };

        reader.onerror = function() {
            closeModal('progressModal');
            showImportResult(false, '导入失败', '读取文件时发生错误', { success: 0, failed: 0, duplicates: [] });
        };

        reader.readAsArrayBuffer(file);

    } catch (error) {
        console.error('导入错误:', error);
        closeModal('progressModal');
        showImportResult(false, '导入失败', error.message, { success: 0, failed: 0, duplicates: [] });
    }
}

// 更新进度
function updateProgress(text, percentage) {
    document.getElementById('progressText').textContent = text;
    document.getElementById('progressFill').style.width = percentage + '%';
}

// 显示重复数据对话框（使用 DOM API 构建，避免外部数据拼入 HTML）
function showDuplicateModal(duplicates) {
    const duplicateList = document.getElementById('duplicateList');
    duplicateList.innerHTML = '';

    // 最多显示10条重复记录
    const displayDuplicates = duplicates.slice(0, 10);

    displayDuplicates.forEach(duplicate => {
        const item = document.createElement('div');
        item.className = 'duplicate-item';

        const fieldSpan = document.createElement('span');
        fieldSpan.className = 'duplicate-field';
        fieldSpan.textContent = `${duplicate.type}：${duplicate.value}`;
        item.appendChild(fieldSpan);
        item.appendChild(document.createElement('br'));

        let summary = `新记录：${duplicate.name || '（空）'}`;
        if (duplicate.existingName) {
            summary += ` | 已存在：${duplicate.existingName}`;
        }
        item.appendChild(document.createTextNode(summary));
        duplicateList.appendChild(item);
    });

    if (duplicates.length > 10) {
        const moreInfo = document.createElement('div');
        moreInfo.className = 'duplicate-item';
        moreInfo.style.color = '#666';
        moreInfo.style.fontStyle = 'italic';
        moreInfo.textContent = `... 还有 ${duplicates.length - 10} 条重复记录`;
        duplicateList.appendChild(moreInfo);
    }

    showModal('duplicateModal');
}

// 用户选择"跳过重复项并导入其余"：导入未重复的记录（导入语义为整体替换现有数据库）
async function importSkippingDuplicates() {
    if (!pendingImport) {
        closeModal('duplicateModal');
        return;
    }
    const { contacts, duplicateIndexes } = pendingImport;
    pendingImport = null;
    closeModal('duplicateModal');

    const validContacts = contacts.filter((_, idx) => !duplicateIndexes.has(idx));
    if (validContacts.length === 0) {
        showImportResult(false, '导入失败', '所有记录均为重复数据，无可导入内容', { success: 0, failed: 0, duplicates: [] });
        return;
    }

    showModal('progressModal');
    updateProgress('正在保存数据...', 90);

    try {
        await db.contacts.clear();
        await db.contacts.bulkAdd(validContacts);

        updateProgress('导入完成！', 100);
        document.getElementById('emptyState').style.display = 'none';

        setTimeout(() => {
            closeModal('progressModal');
            showImportResult(true, '导入成功', `已跳过 ${duplicateIndexes.size} 条重复记录`, {
                success: validContacts.length,
                failed: 0,
                duplicates: []
            });
            clearResults();
        }, 500);
    } catch (error) {
        console.error('导入错误:', error);
        closeModal('progressModal');
        showImportResult(false, '导入失败', error.message, { success: 0, failed: 0, duplicates: [] });
    }
}

// 显示导入结果对话框
function showImportResult(success, title, message, stats) {
    const resultDiv = document.getElementById('importResult');
    const titleDiv = document.getElementById('resultTitle');

    titleDiv.textContent = title;

    if (success) {
        resultDiv.className = 'import-result result-success';
        resultDiv.innerHTML = `
            <div class="result-icon">✅</div>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(message)}</p>
            <div class="result-stats">
                <div class="stat-row">
                    <span class="stat-label">成功导入</span>
                    <span class="stat-value success">${stats.success} 条</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">导入失败</span>
                    <span class="stat-value error">${stats.failed} 条</span>
                </div>
            </div>
        `;
    } else {
        resultDiv.className = 'import-result result-error';
        resultDiv.innerHTML = `
            <div class="result-icon">❌</div>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(message)}</p>
            <div class="result-stats">
                <div class="stat-row">
                    <span class="stat-label">成功导入</span>
                    <span class="stat-value success">0 条</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">导入失败</span>
                    <span class="stat-value error">全部</span>
                </div>
            </div>
        `;
    }

    showModal('resultModal');
}

// 搜索联系人
async function searchContacts() {
    const keyword = document.getElementById('searchInput').value.trim();

    if (!keyword) {
        alert('请输入搜索关键词');
        return;
    }

    const resultsGrid = document.getElementById('resultsGrid');
    resultsGrid.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">🔍 搜索中...</div>';

    try {
        // 获取所有联系人
        const allContacts = await db.contacts.toArray();

        // 精确匹配：姓名、手机、短号
        const matchedContacts = allContacts.filter(contact => {
            return contact.name === keyword ||
                   contact.phone === keyword ||
                   contact.shortPhone === keyword;
        });

        // 显示结果
        if (matchedContacts.length === 0) {
            resultsGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1;">
                    <div class="icon">🔍</div>
                    <h3>未找到相关联系人</h3>
                    <p>请检查搜索关键词是否正确</p>
                </div>
            `;
        } else {
            displayContacts(matchedContacts);
        }

    } catch (error) {
        console.error('搜索错误:', error);
        resultsGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1;">
                <div class="icon">❌</div>
                <h3>搜索出错</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;
    }
}

// 显示联系人列表
function displayContacts(contacts) {
    const resultsGrid = document.getElementById('resultsGrid');
    resultsGrid.innerHTML = '';

    contacts.forEach((contact, index) => {
        const card = createContactCard(contact, index);
        resultsGrid.appendChild(card);
    });

    // 隐藏空状态
    document.getElementById('emptyState').style.display = 'none';
}

// 字段图标映射（模块级，供 buildInfoRow 使用）
const fieldIcons = {
    department: '🏢',
    name: '👤',
    email: '📧',
    phone: '📱',
    shortPhone: '📞',
    position: '💼',
    gender: '⚧',
    employeeId: '🆔',
    hireDate: '📅',
    detailDepartment: '📍',
    company: '🏢'
};

// 字段标签映射
const fieldLabels = {
    department: '部门',
    name: '姓名',
    email: '邮箱',
    phone: '手机',
    shortPhone: '短号',
    position: '职位',
    gender: '性别',
    employeeId: '工号',
    hireDate: '入职时间',
    detailDepartment: '详细部门',
    company: '公司'
};

// 构建单个信息行：值全部转义，可复制字段用 data-copy 属性 + 事件委托，不再拼内联 onclick
function buildInfoRow(field, rawValue, fullWidth = false) {
    const value = rawValue || '';
    const isEmpty = !value;
    const isClickable = (field === 'phone' || field === 'email') && !isEmpty;
    const widthClass = fullWidth ? ' full-width' : '';
    const emptyClass = isEmpty ? ' empty' : '';
    const clickClass = isClickable ? ' clickable' : '';
    const copyAttr = isClickable ? ` data-copy="${escapeHtml(value)}"` : '';
    const displayText = isEmpty ? '（未填写）' : escapeHtml(value);

    return `
        <div class="info-row${widthClass}">
            <span class="info-icon">${fieldIcons[field]}</span>
            <span class="info-label">${fieldLabels[field]}:</span>
            <span class="info-value${emptyClass}${clickClass}"${copyAttr}>${displayText}</span>
        </div>
    `;
}

// 创建联系人卡片
function createContactCard(contact, index) {
    const card = document.createElement('div');
    card.className = 'contact-card';

    // 获取姓名的首字符作为头像
    const avatarChar = contact.name ? contact.name.charAt(0) : '?';

    // 生成信息行（按指定顺序排列）
    const fieldGroups = [
        { field1: 'department', field2: 'gender' },
        { field1: 'phone', field2: 'shortPhone' },
        { field1: 'employeeId', field2: 'hireDate' },
        { field1: 'detailDepartment', field2: 'company' }
    ];

    let infoRowsHTML = '';
    fieldGroups.forEach(group => {
        infoRowsHTML += '<div class="info-row-group">';
        infoRowsHTML += buildInfoRow(group.field1, contact[group.field1]);
        infoRowsHTML += buildInfoRow(group.field2, contact[group.field2]);
        infoRowsHTML += '</div>';
    });

    // 邮箱单独一行（占满宽度）
    infoRowsHTML += buildInfoRow('email', contact.email, true);

    card.innerHTML = `
        <div class="card-header">
            <div class="avatar">${escapeHtml(avatarChar)}</div>
            <div class="name-info">
                <div class="name">${escapeHtml(contact.name || '（未填写）')}</div>
                <div class="position">${escapeHtml(contact.position || '（未填写职位）')}</div>
            </div>
        </div>
        ${infoRowsHTML}
    `;

    return card;
}

// 复制到剪贴板
async function copyToClipboard(text) {
    try {
        // 使用现代API复制
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            showToast('已复制到剪贴板');
        } else {
            // 降级方案：使用document.execCommand
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showToast('已复制到剪贴板');
            } catch (err) {
                console.error('复制失败:', err);
                showToast('复制失败，请手动复制');
            }
            document.body.removeChild(textarea);
        }
    } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败，请手动复制');
    }
}

// 显示提示信息
function showToast(message) {
    // 移除现有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // 创建新的toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 3秒后自动消失
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 2000);
}

// 更新总记录数
// 清空结果
function clearResults() {
    document.getElementById('resultsGrid').innerHTML = '';
    // document.getElementById('resultCount').textContent = '0'; // 统计信息已移除
    document.getElementById('searchInput').value = '';
}

// 显示模态框
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

// 关闭模态框
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// 点击模态框外部关闭
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
});

// 支持回车键搜索
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchContacts();
    }
});

// 卡片可复制字段的事件委托：点击带 data-copy 的元素即复制（替代原内联 onclick，杜绝注入）
document.getElementById('resultsGrid').addEventListener('click', function(e) {
    const target = e.target.closest('[data-copy]');
    if (target) {
        copyToClipboard(target.getAttribute('data-copy'));
    }
});

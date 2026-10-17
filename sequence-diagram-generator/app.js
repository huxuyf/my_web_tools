// 初始化 Mermaid (配置更美观的时序图)
    mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
            background: '#ffffff',
            primaryColor: '#3b82f6',
            primaryBorderColor: '#2563eb',
            primaryTextColor: '#0f172a',
            lineColor: '#475569',
            secondaryColor: '#f1f5f9',
            tertiaryColor: '#f8fafc',
            noteBkgColor: '#fef9c3',
            noteTextColor: '#854d0e',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            actorBkg: '#e0f2fe',
            actorBorder: '#0284c7',
            actorTextColor: '#0c4a6e',
            actorLineColor: '#0369a1'
        },
        sequence: {
            diagramMarginX: 80,
            diagramMarginY: 30,
            actorMargin: 100,
            width: 200,
            height: 75,
            boxMargin: 15,
            boxTextMargin: 8,
            noteMargin: 15,
            messageMargin: 55,
            mirrorActors: false,
            useMaxWidth: true,
            rightAngles: false,
            showSequenceNumbers: false,
            wrap: true
        }
    });

    // DOM 元素
    const textarea = document.getElementById('eventInput');
    const generateBtn = document.getElementById('generateBtn');
    const exportPngBtn = document.getElementById('exportPngBtn');
    const exportSvgBtn = document.getElementById('exportSvgBtn');
    const mermaidContainer = document.getElementById('mermaid-diagram');
    const errorDiv = document.getElementById('errorMsg');
    const statsSpan = document.getElementById('statsInfo');
    const mermaidCodeEditor = document.getElementById('mermaidCodeEditor');

    // 示例原始数据
    const defaultExample = `17:56:03, 短信系统, 发送第154条短信
18:15:00, 本地表, 插入
18:17:29, 识别程序, 程序识别
18:18:08, 关停系统, 送关停
18:29:20, 关停系统, 实际关停`;

    // 辅助: 解析时间 "HH:MM:SS" 转为秒数
    function timeToSeconds(timeStr) {
        const parts = timeStr.split(':');
        if (parts.length !== 3) return NaN;
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseInt(parts[2], 10);
        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return NaN;
        return hours * 3600 + minutes * 60 + seconds;
    }

    // 格式化秒数为友好字符串: X分Y秒 / X秒
    function formatDuration(secondsDiff) {
        if (isNaN(secondsDiff)) return '?';
        const absDiff = Math.abs(secondsDiff);
        const mins = Math.floor(absDiff / 60);
        const secs = absDiff % 60;
        if (mins === 0) return `${secs}秒`;
        if (secs === 0) return `${mins}分`;
        return `${mins}分${secs}秒`;
    }

    // 解析事件文本为事件对象数组 [{timeStr, system, action, timestampSec}]
    function parseEvents(inputText) {
        const lines = inputText.split(/\r?\n/);
        const events = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') continue;
            // 格式: 时间, 系统, 操作
            const parts = line.split(',').map(p => p.trim());
            if (parts.length < 3) {
                throw new Error(`第 ${i+1} 行格式错误: 需要至少三个字段 (时间, 系统, 操作)`);
            }
            const timeStr = parts[0];
            const system = parts[1];
            const action = parts.slice(2).join(','); // 操作描述可能包含逗号，合并
            const timestampSec = timeToSeconds(timeStr);
            if (isNaN(timestampSec)) {
                throw new Error(`第 ${i+1} 行时间格式无效: "${timeStr}", 请使用 HH:MM:SS 格式`);
            }
            events.push({ timeStr, system, action, timestampSec, rawLine: line });
        }
        if (events.length < 2) {
            throw new Error('至少需要两个事件才能生成时序图');
        }
        // 验证时间顺序 (非严格但提示)
        for (let i = 1; i < events.length; i++) {
            if (events[i].timestampSec < events[i-1].timestampSec) {
                console.warn(`事件时间未按顺序: ${events[i-1].timeStr} -> ${events[i].timeStr}`);
            }
        }
        return events;
    }

    // 生成 Mermaid 时序图代码 (优化版)
    function buildMermaidSequence(events) {
        // 收集所有参与者 (系统)
        const participantsSet = new Set();
        events.forEach(ev => participantsSet.add(ev.system));
        const participants = Array.from(participantsSet);

        // 构建参与者声明
        let mermaidLines = ['sequenceDiagram', '    autonumber', ''];

        // 添加参与者 (保留原始顺序按出现顺序)
        const orderedParticipants = [];
        for (let ev of events) {
            if (!orderedParticipants.includes(ev.system)) orderedParticipants.push(ev.system);
        }
        orderedParticipants.forEach(p => {
            mermaidLines.push(`    participant ${p}`);
        });
        mermaidLines.push('');

        // 生成消息和备注
        for (let i = 0; i < events.length - 1; i++) {
            const curr = events[i];
            const next = events[i+1];
            const fromSys = curr.system;
            const toSys = next.system;
            const timeDiffSec = next.timestampSec - curr.timestampSec;
            const durationText = formatDuration(timeDiffSec);

            // 在当前系统下方显示时间+行动
            mermaidLines.push(`    Note over ${fromSys}: ${curr.timeStr} - ${curr.action}`);

            // 添加消息，在连接线上显示间隔时间
            if (timeDiffSec >= 0) {
                mermaidLines.push(`    ${fromSys}->>${toSys}: ⏱️ 间隔 ${durationText}`);
            } else {
                mermaidLines.push(`    ${fromSys}->>${toSys}: ⚠️ 时间倒序 ${durationText}`);
            }
        }

        // 最后一个事件
        const lastEvent = events[events.length-1];
        mermaidLines.push(`    Note over ${lastEvent.system}: ${lastEvent.timeStr} - ${lastEvent.action}`);

        // 总耗时统计
        const firstEvent = events[0];
        const totalDurationSec = lastEvent.timestampSec - firstEvent.timestampSec;
        const totalDurText = formatDuration(totalDurationSec);
        mermaidLines.push(`    Note over ${orderedParticipants[0]}: ✅ 总耗时: ${totalDurText} (${firstEvent.timeStr} → ${lastEvent.timeStr})`);

        return mermaidLines.join('\n');
    }

    // 渲染图表
    let currentMermaidCode = '';
    let updateFromEditor = false;

    async function renderDiagram(mermaidCode) {
        if (!mermaidCode || mermaidCode.trim() === '') {
            mermaidContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: #94a3b8;">⚠️ 无有效内容，请检查输入</div>';
            return false;
        }
        mermaidContainer.innerHTML = '<div id="mermaid-svg-wrapper" style="min-height: 380px; display: flex; align-items: center; justify-content: center;">⌛ 渲染时序图中...</div>';
        try {
            const id = `mermaid-${Date.now()}`;
            const { svg } = await mermaid.render(id, mermaidCode);
            mermaidContainer.innerHTML = svg;
            return true;
        } catch (err) {
            console.error(err);
            mermaidContainer.innerHTML = `<div style="color:#b91c1c; background:#fee2e2; padding:20px; border-radius:16px;">❌ 渲染错误: ${escapeHtml(err.message)}<br><pre style="font-size:11px; margin-top:8px;">${escapeHtml(mermaidCode.substring(0, 800))}</pre></div>`;
            return false;
        }
    }

    // 辅助防XSS
    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // 主流程: 解析输入 -> 构建代码 -> 渲染并更新统计
    async function generateFromInput() {
        errorDiv.style.display = 'none';
        const rawText = textarea.value;
        if (!rawText.trim()) {
            showError('请输入事件数据');
            return;
        }
        try {
            const events = parseEvents(rawText);
            if (events.length < 2) {
                showError('至少需要2个事件才能生成时序图');
                return;
            }
            const mermaidCode = buildMermaidSequence(events);
            currentMermaidCode = mermaidCode;
            if (!updateFromEditor) {
                mermaidCodeEditor.value = mermaidCode;
            }
            const success = await renderDiagram(mermaidCode);
            if (success) {
                const first = events[0];
                const last = events[events.length-1];
                const totalSec = last.timestampSec - first.timestampSec;
                const totalDur = formatDuration(totalSec);
                statsSpan.innerHTML = `📈 总耗时: ${totalDur}  (${first.timeStr} → ${last.timeStr}) &nbsp;&nbsp;| 事件数量: ${events.length} &nbsp;| 参与者: ${new Set(events.map(e=>e.system)).size} 个系统`;
            } else {
                statsSpan.innerHTML = `⚠️ 渲染失败，请检查输入或时间格式`;
            }
        } catch (err) {
            showError(err.message);
            statsSpan.innerHTML = `❌ 解析错误: 无法生成图表`;
            mermaidContainer.innerHTML = '<div style="padding: 30px; text-align:center; color:#ef4444;">解析错误，请检查格式</div>';
        }
    }

    // 从编辑器渲染
    async function renderFromEditor() {
        errorDiv.style.display = 'none';
        const editorCode = mermaidCodeEditor.value.trim();
        if (!editorCode) {
            showError('编辑器中没有Mermaid代码');
            return false;
        }
        try {
            currentMermaidCode = editorCode;
            const success = await renderDiagram(editorCode);
            if (success) {
                statsSpan.innerHTML = `📊 从编辑器渲染 | 代码长度: ${editorCode.length} 字符`;
            } else {
                statsSpan.innerHTML = `⚠️ 渲染失败，请检查Mermaid代码语法`;
            }
            return success;
        } catch (err) {
            showError('渲染错误: ' + err.message);
            return false;
        }
    }

    function showError(msg) {
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = `⚠️ ${msg}`;
        setTimeout(() => {
            if (errorDiv.style.display === 'block') errorDiv.style.display = 'none';
        }, 5000);
    }

    // 导出图片 (高分辨率)
    async function exportAsImage() {
        if (!currentMermaidCode) {
            showError('请先生成时序图');
            return;
        }
        const targetElement = document.querySelector('#mermaid-container svg');
        if (!targetElement) {
            showError('未找到时序图SVG元素，请先生成有效图表');
            return;
        }
        // 创建一个临时容器确保背景
        const container = document.createElement('div');
        container.style.background = 'white';
        container.style.padding = '40px';
        container.style.borderRadius = '16px';
        container.style.display = 'inline-block';
        container.style.minWidth = '1200px';
        const cloneSvg = targetElement.cloneNode(true);
        cloneSvg.style.width = '100%';
        cloneSvg.style.height = 'auto';
        container.appendChild(cloneSvg);
        document.body.appendChild(container);
        try {
            const canvas = await html2canvas(container, {
                scale: 4, // 提高分辨率
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true
            });
            const link = document.createElement('a');
            link.download = 'sequence_diagram.png';
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        } catch (err) {
            showError('导出失败: ' + err.message);
        } finally {
            document.body.removeChild(container);
        }
    }

    // 导出SVG
    function exportAsSVG() {
        if (!currentMermaidCode) {
            showError('请先生成时序图');
            return;
        }
        const targetElement = document.querySelector('#mermaid-container svg');
        if (!targetElement) {
            showError('未找到时序图SVG元素，请先生成有效图表');
            return;
        }
        // 添加白色背景
        const svgClone = targetElement.cloneNode(true);
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', 'white');
        svgClone.insertBefore(rect, svgClone.firstChild);

        const svgData = new XMLSerializer().serializeToString(svgClone);
        const blob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'sequence_diagram.svg';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    // 标签页切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}Tab`).classList.add('active');
        });
    });

    // 绑定事件
    generateBtn.addEventListener('click', generateFromInput);
    exportPngBtn.addEventListener('click', exportAsImage);
    exportSvgBtn.addEventListener('click', exportAsSVG);

    // 编辑器输入事件（防抖；等待渲染完成后再复位标志，避免与"生成"按钮产生竞态）
    let editorTimeout;
    mermaidCodeEditor.addEventListener('input', () => {
        clearTimeout(editorTimeout);
        editorTimeout = setTimeout(async () => {
            updateFromEditor = true;
            try {
                await renderFromEditor();
            } finally {
                updateFromEditor = false;
            }
        }, 800);
    });

    // 页面加载自动生成一次示例效果
    window.addEventListener('DOMContentLoaded', () => {
        textarea.value = defaultExample;
        generateFromInput();
    });
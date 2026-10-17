// GBK编码计算长度
        function getGBKLength(str) {
            let length = 0;
            for (let i = 0; i < str.length; i++) {
                const charCode = str.charCodeAt(i);
                if (charCode > 0 && charCode < 128) {
                    length += 1;
                } else {
                    length += 2;
                }
            }
            return length;
        }

        // 清空输入
        function clearInput() {
            if (confirm('确定要清空内容吗？')) {
                document.getElementById('inputData').value = '';
            }
        }

        // 从剪贴板粘贴
        async function pasteFromClipboard() {
            try {
                const text = await navigator.clipboard.readText();
                document.getElementById('inputData').value = text;
                showToast('已从剪贴板粘贴！');
            } catch (err) {
                alert('无法访问剪贴板，请手动粘贴数据。');
            }
        }

        // 复制到剪贴板
        function copyToClipboard() {
            const outputText = document.getElementById('inputData').value;
            if (outputText.trim() === '') {
                alert('没有可复制的内容，请先输入或转换数据！');
                return;
            }

            navigator.clipboard.writeText(outputText).then(function() {
                showToast('已复制到剪贴板！');
            }).catch(function(err) {
                // 如果现代API失败，使用传统方法
                const textarea = document.getElementById('inputData');
                textarea.select();
                if (document.execCommand('copy')) {
                    showToast('已复制到剪贴板！');
                } else {
                    showToast('复制失败，请手动复制');
                }
            });
        }

        // 显示提示
        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(function() {
                toast.classList.remove('show');
            }, 2000);
        }

        // 转换为SQL
        function convertToSql() {
            const inputText = document.getElementById('inputData').value.trim();
            let tableName = 'TMP_IMP_DATA';
            let splitLineNum = 1000;
            
            // 检查元素是否存在
            const tableNameElement = document.getElementById('tableName');
            if (tableNameElement) {
                tableName = tableNameElement.value.trim() || 'TMP_IMP_DATA';
            }
            
            const splitLineNumElement = document.getElementById('splitLineNum');
            if (splitLineNumElement) {
                const parsedSplit = parseInt(splitLineNumElement.value, 10);
                // 防御 0、负数、NaN：非法输入一律回退默认值 1000
                splitLineNum = (parsedSplit > 0) ? parsedSplit : 1000;
            }

            if (!inputText) {
                alert('请输入数据！');
                return;
            }

            // 使用回车+换行符进行分割
            // 行以回车、换行分割，列以TAB分割
            const lines = inputText.split(/\r?\n/).filter(row => row.trim().length > 0);

            if (lines.length < 1) {
                alert('数据格式错误，至少需要一行标题！');
                return;
            }

            // 分割数据
            const tmp = lines.map(row => {
                return row.split('\t').map(col => col.trim());
            });

            // 行数（含标题）
            const rowNumsX = tmp.length;
            // 行数（不含标题）
            const rowNums = tmp.length - 1;
            // 列数（以第一行为准）
            const colNums = tmp[0].length;

            if (rowNums < 1) {
                alert('数据格式错误，至少需要一行标题和一行数据！');
                return;
            }

            // 按列分组
            const result = [];
            for (let i = 0; i < colNums; i++) {
                result[i] = [];
                for (let j = 1; j < tmp.length; j++) {
                    if (tmp[j][i] !== undefined) {
                        result[i].push(tmp[j][i]);
                    }
                }
            }

            // 生成SQL（SET DEFINE OFF 规避 SQL*Plus 将 & 解析为替换变量，避免数据被篡改）
            let sqlString = 'SET DEFINE OFF;\n';
            sqlString += `CALL xyf.drop_table('${tableName}');\n`;

            // 建表
            sqlString += `CREATE TABLE ${tableName}\n`;

            let title = '';
            const usedNames = [];

            for (let i = 0; i < colNums; i++) {
                // 第一行作为标题行，对列名进行处理
                // 规范化为合法的 Oracle 标识符：替换非法字符、数字开头加前缀、限制 30 字符
                let columnName = String(tmp[0][i]).trim()
                    .replace(/[^\w\u4e00-\u9fa5#$]/g, '_')
                    .replace(/^(\d)/, 'C_$1')
                    .slice(0, 30);

                if (columnName === '' || columnName === '_') {
                    columnName = 'COLUMN_NAME_' + (i + 1);
                } else {
                    // 检查是否有重复列名（与已规范化的列名对比）
                    let count = 0;
                    for (let k = 0; k < usedNames.length; k++) {
                        if (usedNames[k] === columnName) {
                            count++;
                        }
                    }
                    if (count > 0) {
                        columnName = (columnName + '_' + count).slice(0, 30);
                    }
                }

                usedNames.push(columnName);

                // 计算列长度
                let maxLength = 0;
                if (result[i] && result[i].length > 0) {
                    maxLength = Math.max(...result[i].map(item => getGBKLength(item)));
                }
                let columnSize = Math.ceil((maxLength + 9) / 10) * 10;
                columnSize = columnSize > 5 ? columnSize : 5;
                // VARCHAR2 上限保护，避免超长数据生成非法 DDL
                columnSize = Math.min(columnSize, 4000);

                title += columnName + ' VARCHAR2(' + columnSize + '),';
            }

            sqlString += '(N NUMBER,' + title.slice(0, -1) + ');\n';

            // 插入数据
            let insertString = 'INSERT ALL \n';
            let columnString = '';

            for (let j = 0; j < rowNums; j++) {
                for (let i = 0; i < colNums; i++) {
                    // 处理字段内容中含有单引号的情况（& 已由脚本头部的 SET DEFINE OFF 规避，不再删除数据字符）
                    let columnContent = '';
                    if (tmp[j + 1][i] !== undefined) {
                        columnContent = tmp[j + 1][i].replace(/'/g, "''");
                    }
                    columnString += '\'' + columnContent + '\',';
                }
                insertString += 'INTO ' + tableName + ' VALUES (' + (j + 1) + ',' + columnString.slice(0, -1) + ')\n';
                columnString = '';

                // 按照N行进行分割，而不是全部数据同时插入
                if ((j + 1) % splitLineNum === 0) {
                    sqlString += insertString + 'SELECT 1 FROM DUAL;\nCOMMIT;\n';
                    insertString = 'INSERT ALL \n';
                }
            }

            // 如果插入的行数正好是N的倍数，则不需要再添加语句了
            if (rowNums % splitLineNum !== 0) {
                sqlString += insertString + 'SELECT 1 FROM DUAL;\nCOMMIT;\n';
            }

            // 最后增加一句查询统计数量的语句
            sqlString += 'SELECT COUNT(*) FROM ' + tableName + ';\n';

            // 显示结果（覆盖输入框内容）
            document.getElementById('inputData').value = sqlString;
            showToast('转换完成！');
        }
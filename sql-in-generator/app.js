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
                alert('没有可复制的内容，请先输入或拼接文字！');
                return;
            }

            navigator.clipboard.writeText(outputText).then(function() {
                showToast('已复制到剪贴板！');
            }).catch(function(err) {
                // 如果现代API失败，使用传统方法
                const textarea = document.getElementById('inputData');
                textarea.select();
                document.execCommand('copy');
                showToast('已复制到剪贴板！');
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

        // 拼接文字
        function joinText() {
            const inputText = document.getElementById('inputData').value;
            const quoteType = document.getElementById('quoteType').value;
            const separator = document.getElementById('separator').value;
            const addBrackets = document.getElementById('addBrackets').value;
            const prefix = document.getElementById('prefix').value;
            const suffix = document.getElementById('suffix').value;

            if (!inputText.trim()) {
                alert('请输入文字！');
                return;
            }

            // 分割行，去除空行和空白字符
            const lines = inputText.split(/\r?\n/)
                .map(line => line.trim())
                .filter(line => line.length > 0);

            if (lines.length === 0) {
                alert('没有有效的文字！');
                return;
            }

            // 确定引号
            let quote = '';
            if (quoteType === 'single') {
                quote = "'";
            } else if (quoteType === 'double') {
                quote = '"';
            }

            // 确定分隔符
            let sep = '';
            if (separator === 'comma') {
                sep = ',';
            } else if (separator === 'semicolon') {
                sep = ';';
            } else if (separator === 'space') {
                sep = ' ';
            } else if (separator === 'newline') {
                sep = '\n';
            }

            // 拼接文字
            const joinedText = lines.map(line => quote + line + quote).join(sep);

            // 添加括号
            let result = joinedText;
            if (addBrackets === 'yes') {
                result = '(' + result + ')';
            }

            // 添加前缀和后缀
            if (prefix) {
                result = prefix + result;
            }
            if (suffix) {
                result = result + suffix;
            }

            // 显示结果（覆盖输入框内容）
            document.getElementById('inputData').value = result;
            showToast('拼接完成！');
        }
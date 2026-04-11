function splitText(text) {
            // 使用正则表达式分割文本，支持空格、逗号、制表符、换行符
            const elements = text.split(/[\s,\t\n\r]+/);
            // 过滤掉空字符串
            return elements.filter(element => element.trim() !== '');
        }

        function processText() {
            const textA = document.getElementById('textA').value;
            const textB = document.getElementById('textB').value;

            // 分割文本
            const elementsA = splitText(textA);
            const elementsB = splitText(textB);

            if (elementsA.length === 0 || elementsB.length === 0) {
                alert('请输入文本A和文本B！');
                return;
            }

            // 一一对应组合
            const minLength = Math.min(elementsA.length, elementsB.length);
            const combinedPairs = [];

            for (let i = 0; i < minLength; i++) {
                combinedPairs.push(`${elementsA[i]} ${elementsB[i]}`);
            }

            // 用逗号分隔所有组合对
            const result = combinedPairs.join(',');

            // 显示结果
            document.getElementById('output').value = result;

            // 如果两个列表长度不一致，给出提示
            if (elementsA.length !== elementsB.length) {
                const maxLength = Math.max(elementsA.length, elementsB.length);
                alert(`注意：两个文本的元素数量不一致！\n文本A有 ${elementsA.length} 个元素\n文本B有 ${elementsB.length} 个元素\n已组合前 ${minLength} 对元素`);
            }
        }

        function clearAll() {
            if (confirm('确定要清空所有内容吗？')) {
                document.getElementById('textA').value = '';
                document.getElementById('textB').value = '';
                document.getElementById('output').value = '';
            }
        }

        // 点击输出框复制功能
        document.getElementById('output').addEventListener('click', function() {
            const outputText = this.value;
            if (outputText.trim() !== '') {
                navigator.clipboard.writeText(outputText).then(function() {
                    showToast();
                }).catch(function(err) {
                    // 如果现代API失败，使用传统方法
                    const textarea = document.getElementById('output');
                    textarea.select();
                    document.execCommand('copy');
                    showToast();
                });
            }
        });

        function showToast() {
            const toast = document.getElementById('toast');
            toast.classList.add('show');
            setTimeout(function() {
                toast.classList.remove('show');
            }, 1000);
        }
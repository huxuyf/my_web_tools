// 检查DHTMLX库是否加载成功
        window.addEventListener('DOMContentLoaded', function() {
            console.log('页面DOM加载完成');
            console.log('DHTMLX Gantt库是否已加载:', typeof gantt !== 'undefined');

            if (typeof gantt === 'undefined') {
                console.error('DHTMLX Gantt库未加载成功!');
                console.error('请检查以下文件是否存在:');
                console.error('1. dhtmlxgantt/codebase/dhtmlxgantt.js');
                console.error('2. dhtmlxgantt/codebase/dhtmlxgantt.css');
                alert('DHTMLX Gantt库加载失败!\n请确保以下文件存在于项目目录中:\n- dhtmlxgantt/codebase/dhtmlxgantt.js\n- dhtmlxgantt/codebase/dhtmlxgantt.css\n\n如果是首次使用,请运行下载脚本获取这些文件。');
            } else {
                console.log('DHTMLX Gantt库版本:', gantt.version || '未知版本');
                console.log('使用本地资源,完全离线可用');
            }
        });
        // 颜色池，为不同终端分配不同颜色
        const colorPool = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
            '#F8B500', '#00CED1', '#FF69B4', '#32CD32', '#FF8C00'
        ];

        // 初始化甘特图
        function initGantt() {
            console.log('开始初始化甘特图...');

            // 配置甘特图
            gantt.config.date_format = "%Y-%m-%d";
            gantt.config.xml_date = "%Y-%m-%d";
            gantt.config.scale_unit = "day";
            gantt.config.date_scale = "%m-%d";  // 修改日期格式为 mm-dd
            gantt.config.scale_height = 50;
            gantt.config.row_height = 35;
            gantt.config.task_height = 25;
            gantt.config.show_links = false;
            gantt.config.show_grid = true;
            gantt.config.readonly = true;
            gantt.config.autosize = false;  // 禁用自动调整大小

            // 配置列
            gantt.config.columns = [
                { name: "text", label: "终端名称", width: 120, tree: true }
            ];

            // 自定义任务条样式
            gantt.templates.task_class = function(start, end, task) {
                return "custom_task";
            };

            gantt.templates.task_text = function(start, end, task) {
                return `<span style="color: white; font-weight: bold; font-size: 11px;">${task.text}</span>`;
            };

            // 自定义时间轴刻度格式
            gantt.templates.date_scale = function(date) {
                return gantt.date.date_to_str("%m-%d")(date);
            };

            gantt.templates.timeline_cell_class = function(task, date) {
                if (!date) return "";
                return "";
            };

            // 初始化甘特图
            try {
                const container = document.getElementById('gantt_container');
                console.log('容器元素:', container);
                console.log('容器尺寸(初始化前):', {
                    width: container.offsetWidth,
                    height: container.offsetHeight
                });

                gantt.init(container);

                console.log('甘特图初始化完成');
                console.log('容器尺寸(初始化后):', {
                    width: container.offsetWidth,
                    height: container.offsetHeight
                });
                console.log('容器子元素数量:', container.children.length);
            } catch (error) {
                console.error('甘特图初始化失败:', error);
            }

            // 添加鼠标悬停事件
            gantt.attachEvent("onMouseMove", function(id, e) {
                // 检查 id 是否有效
                if (id && id !== null && id !== undefined) {
                    try {
                        const task = gantt.getTask(id);
                        if (task) {
                            const tooltip = document.getElementById('tooltip');

                            // 格式化日期为 YYYY-MM-DD 格式
                            const startDate = gantt.date.date_to_str("%Y-%m-%d")(task.start_date);
                            const endDate = gantt.date.date_to_str("%Y-%m-%d")(task.end_date);

                            tooltip.innerHTML = `
                                <strong>${task.text}</strong><br>
                                ${startDate}至${endDate}
                            `;
                            tooltip.style.display = 'block';

                            // 使用 clientX/Y 和 scrollX/Y 计算准确位置
                            const x = e.clientX + window.scrollX + 10;
                            const y = e.clientY + window.scrollY + 10;

                            tooltip.style.left = x + 'px';
                            tooltip.style.top = y + 'px';
                        }
                    } catch (error) {
                        // 忽略错误,防止影响用户体验
                        console.log('鼠标悬停事件错误:', error);
                    }
                }
            });

            gantt.attachEvent("onMouseLeave", function() {
                document.getElementById('tooltip').style.display = 'none';
            });
        }

        // 计算时长（天数）
        function calculateDuration(startDate, endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        }

        // 解析输入数据
        function parseInputData(inputText) {
            const lines = inputText.trim().split('\n');
            const tasks = [];
            let minDate = null;
            let maxDate = null;

            lines.forEach((line, index) => {
                line = line.trim();
                if (!line) return;

                // 支持多种分隔符：中文冒号、英文冒号、空格
                let parts = line.split(/[:：]/);
                if (parts.length < 2) {
                    parts = line.split(/\s+/);
                }

                if (parts.length >= 2) {
                    const terminalName = parts[0].trim();
                    const datePart = parts.slice(1).join('').trim();

                    console.log(`处理行 "${line}":`, {
                        parts,
                        terminalName,
                        datePart
                    });

                    // 支持多种日期分隔符：中文"至"、英文"-"、英文"to"
                    // 注意: - 需要转义或放在字符类开头/结尾
                    let dateRange = datePart.split(/至|to|TO/);

                    if (dateRange.length >= 2) {
                        const startDateStr = dateRange[0].trim();
                        const endDateStr = dateRange[1].trim();

                        console.log(`解析第${index + 1}行:`, {
                            terminalName,
                            rawDate: datePart,
                            dateRange,
                            startDateStr,
                            endDateStr
                        });

                        const startDate = new Date(startDateStr);
                        const endDate = new Date(endDateStr);

                        console.log(`日期对象:`, {
                            start: startDate,
                            end: endDate,
                            startValid: !isNaN(startDate),
                            endValid: !isNaN(endDate)
                        });

                        if (!isNaN(startDate) && !isNaN(endDate)) {
                            // 更新全局时间范围
                            if (!minDate || startDate < minDate) minDate = startDate;
                            if (!maxDate || endDate > maxDate) maxDate = endDate;

                            // 分配颜色
                            const color = colorPool[index % colorPool.length];

                            tasks.push({
                                id: index + 1,
                                text: terminalName,
                                start_date: startDateStr,
                                end_date: endDateStr,
                                duration: calculateDuration(startDateStr, endDateStr),
                                color: color,
                                progress: 0
                            });
                        }
                    }
                }
            });

            return { tasks, minDate, maxDate };
        }

        // 生成甘特图
        function generateGantt() {
            console.log('开始生成甘特图...');
            const inputText = document.getElementById('data_input').value;
            const errorMessage = document.getElementById('error_message');

            if (!inputText.trim()) {
                errorMessage.textContent = '请输入数据！';
                errorMessage.style.display = 'block';
                return;
            }

            const { tasks, minDate, maxDate } = parseInputData(inputText);
            console.log('解析到的任务数据:', tasks);
            console.log('最小日期:', minDate);
            console.log('最大日期:', maxDate);

            if (tasks.length === 0) {
                errorMessage.textContent = '无法解析数据，请检查格式是否正确！';
                errorMessage.style.display = 'block';
                return;
            }

            errorMessage.style.display = 'none';

            // 设置甘特图时间范围
            if (minDate && maxDate) {
                // 前后各加几天缓冲
                const startDate = new Date(minDate);
                startDate.setDate(startDate.getDate() - 2);

                const endDate = new Date(maxDate);
                endDate.setDate(endDate.getDate() + 2);

                gantt.config.start_date = startDate;
                gantt.config.end_date = endDate;

                // 计算总天数
                const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                console.log('总天数:', totalDays);

                // 获取容器可用宽度（减去终端名称列宽度）
                const container = document.getElementById('gantt_container');
                const availableWidth = container.offsetWidth - 120; // 120是终端名称列宽度

                // 计算每天的宽度
                const dayWidth = Math.floor(availableWidth / totalDays);
                console.log('每天宽度:', dayWidth, 'px');

                // 设置列宽（终端名称列 + 任务区域列）
                gantt.config.columns = [
                    { name: "text", label: "终端名称", width: 120, tree: true }
                ];

                // 设置网格宽度
                gantt.config.grid_width = 120;

                // 根据总天数调整显示方式
                if (totalDays > 90) {
                    // 超过90天,只显示月份
                    gantt.config.scale_unit = "month";
                    gantt.config.date_scale = "%Y-%m";
                    gantt.templates.date_scale = function(date) {
                        return gantt.date.date_to_str("%m")(date);
                    };
                } else if (totalDays > 30) {
                    // 30-90天,显示周
                    gantt.config.scale_unit = "week";
                    gantt.config.date_scale = "%m-%d";
                    gantt.templates.date_scale = function(date) {
                        return gantt.date.date_to_str("%m-%d")(date);
                    };
                } else {
                    // 30天以内,显示天
                    gantt.config.scale_unit = "day";
                    gantt.config.date_scale = "%m-%d";
                    gantt.templates.date_scale = function(date) {
                        return gantt.date.date_to_str("%m-%d")(date);
                    };
                }

                // 如果天数较少且能显示完整,设置列宽
                if (totalDays <= 30) {
                    gantt.config.column_width = Math.max(20, dayWidth);
                }
            }

            // 加载数据
            gantt.clearAll();
            console.log('清空甘特图完成');

            gantt.parse({ data: tasks });
            console.log('数据解析完成');

            // 检查容器状态
            const container = document.getElementById('gantt_container');
            console.log('容器尺寸:', {
                width: container.offsetWidth,
                height: container.offsetHeight,
                display: window.getComputedStyle(container).display,
                visibility: window.getComputedStyle(container).visibility
            });

            // 重新渲染甘特图
            gantt.render();
            console.log('甘特图渲染完成');

            // 检查甘特图内部状态
            console.log('甘特图任务数量:', gantt.getTaskCount());
            console.log('甘特图配置:', {
                startDate: gantt.config.start_date,
                endDate: gantt.config.end_date,
                scaleUnit: gantt.config.scale_unit
            });

            // 检查容器内部HTML
            console.log('容器内部HTML长度:', container.innerHTML.length);
            console.log('容器子元素数量:', container.children.length);
            console.log('容器内部结构:', container.innerHTML.substring(0, 200));

            // 尝试强制刷新甘特图尺寸
            setTimeout(() => {
                console.log('尝试强制刷新...');
                gantt.render();
                console.log('强制刷新完成');
            }, 100);
        }

        // 加载示例数据
        function loadExampleData() {
            const exampleData = `终端A：2025-12-03至2025-12-21
终端B：2025-11-09至2025-12-06
终端C：2025-08-23至2025-11-06
终端D：2025-10-15至2025-11-30
终端E：2025-09-01至2025-10-20`;
            document.getElementById('data_input').value = exampleData;
            generateGantt();
        }

        // 清空数据
        function clearData() {
            document.getElementById('data_input').value = '';
            gantt.clearAll();
            document.getElementById('error_message').style.display = 'none';
        }

        // 调试函数 - 在控制台调用 debugGantt() 查看详细信息
        window.debugGantt = function() {
            const container = document.getElementById('gantt_container');
            console.log('=== 甘特图调试信息 ===');
            console.log('容器元素:', container);
            console.log('容器尺寸:', {
                width: container.offsetWidth,
                height: container.offsetHeight,
                offsetWidth: container.offsetWidth,
                offsetHeight: container.offsetHeight,
                clientWidth: container.clientWidth,
                clientHeight: container.clientHeight
            });
            console.log('容器样式:', {
                display: window.getComputedStyle(container).display,
                visibility: window.getComputedStyle(container).visibility,
                position: window.getComputedStyle(container).position,
                overflow: window.getComputedStyle(container).overflow
            });
            console.log('容器子元素数量:', container.children.length);
            console.log('容器子元素:', container.children);
            console.log('容器内部HTML长度:', container.innerHTML.length);
            console.log('gantt对象:', gantt);
            console.log('gantt配置:', gantt.config);
            console.log('gantt任务数量:', gantt.getTaskCount());
            console.log('gantt所有任务:', gantt.getTaskByTime());

            // 检查是否有.gantt_container类
            const ganttContainer = container.querySelector('.gantt_container');
            console.log('.gantt_container元素:', ganttContainer);
            if (ganttContainer) {
                console.log('.gantt_container尺寸:', {
                    width: ganttContainer.offsetWidth,
                    height: ganttContainer.offsetHeight
                });
            }
        };

        // 页面加载时初始化
        window.addEventListener('load', function() {
            console.log('window.onload 触发');
            // 等待DHTMLX库加载完成
            if (typeof gantt === 'undefined') {
                console.error('DHTMLX Gantt库未加载!');
                return;
            }

            // 直接初始化正式甘特图
            initGantt();
            // 自动加载示例数据
            loadExampleData();
        });
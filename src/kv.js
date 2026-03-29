export async function 迁移地址列表(env, txt = 'ADD.txt') {
  const 旧数据 = await env.KV.get(`/${txt}`);
  const 新数据 = await env.KV.get(txt);

  if (旧数据 && !新数据) {
    await env.KV.put(txt, 旧数据);
    await env.KV.delete(`/${txt}`);
    return true;
  }
  return false;
}

export async function handleKVEditor(request, env, state, txt = 'ADD.txt', guest) {
  const url = new URL(request.url);
  try {
    if (request.method === 'POST') {
      if (!env.KV) return new Response('未绑定KV空间', { status: 400 });
      try {
        const content = await request.text();
        await env.KV.put(txt, content);
        return new Response('保存成功');
      } catch (error) {
        console.error('保存KV时发生错误:', error);
        return new Response(`保存失败: ${error.message}`, { status: 500 });
      }
    }

    let content = '';
    const hasKV = !!env.KV;

    if (hasKV) {
      try {
        content = await env.KV.get(txt) || '';
      } catch (error) {
        console.error('读取KV时发生错误:', error);
        content = `读取数据时发生错误: ${error.message}`;
      }
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${state.FileName} 订阅编辑</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              margin: 0;
              padding: 15px;
              box-sizing: border-box;
              font-size: 13px;
            }
            .editor-container {
              width: 100%;
              max-width: 100%;
              margin: 0 auto;
            }
            .editor {
              width: 100%;
              height: 300px;
              margin: 15px 0;
              padding: 10px;
              box-sizing: border-box;
              border: 1px solid #ccc;
              border-radius: 4px;
              font-size: 13px;
              line-height: 1.5;
              overflow-y: auto;
              resize: none;
            }
            .save-container {
              margin-top: 8px;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .save-btn, .back-btn {
              padding: 6px 15px;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            .save-btn {
              background: #4CAF50;
            }
            .save-btn:hover {
              background: #45a049;
            }
            .back-btn {
              background: #666;
            }
            .back-btn:hover {
              background: #555;
            }
            .save-status {
              color: #666;
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
        </head>
        <body>
          ################################################################<br>
          Subscribe / sub 订阅地址, 点击链接自动 <strong>复制订阅链接</strong> 并 <strong>生成订阅二维码</strong> <br>
          ---------------------------------------------------------------<br>
          自适应订阅地址:<br>
          <a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${state.mytoken}?sub','qrcode_0')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/${state.mytoken}</a><br>
          <div id="qrcode_0" style="margin: 10px 10px 10px 10px;"></div>
          Base64订阅地址:<br>
          <a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${state.mytoken}?b64','qrcode_1')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/${state.mytoken}?b64</a><br>
          <div id="qrcode_1" style="margin: 10px 10px 10px 10px;"></div>
          Clash订阅地址:<br>
          <a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${state.mytoken}?clash','qrcode_2')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/${state.mytoken}?clash</a><br>
          <div id="qrcode_2" style="margin: 10px 10px 10px 10px;"></div>
          &nbsp;&nbsp;<strong><a href="javascript:void(0);" id="noticeToggle" onclick="toggleNotice()">查看访客订阅∨</a></strong><br>
          <div id="noticeContent" class="notice-content" style="display: none;">
            ---------------------------------------------------------------<br>
            访客订阅只能使用订阅功能，无法查看配置页！<br>
            GUEST（访客订阅TOKEN）: <strong>${guest}</strong><br>
            ---------------------------------------------------------------<br>
            自适应订阅地址:<br>
            <a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}','guest_0')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/sub?token=${guest}</a><br>
            <div id="guest_0" style="margin: 10px 10px 10px 10px;"></div>
            Base64订阅地址:<br>
            <a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&b64','guest_1')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/sub?token=${guest}&b64</a><br>
            <div id="guest_1" style="margin: 10px 10px 10px 10px;"></div>
            Clash订阅地址:<br>
            <a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&clash','guest_2')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/sub?token=${guest}&clash</a><br>
            <div id="guest_2" style="margin: 10px 10px 10px 10px;"></div>
          </div>
          ---------------------------------------------------------------<br>
          ################################################################<br>
          内置转换说明<br>
          ---------------------------------------------------------------<br>
          当前版本不再依赖外部 SUBAPI<br>
          Worker 默认在本地生成 Clash 配置；如果配置了 SUBCONFIG，则会按 ini 规则集和策略组动态编译<br>
          ---------------------------------------------------------------<br>
          ################################################################<br>
          ${state.FileName} 汇聚订阅编辑:
          <div class="editor-container">
            ${hasKV ? `
            <textarea class="editor"
              placeholder="${decodeURIComponent(atob('TElOSyVFNyVBNCVCQSVFNCVCRSU4QiVFRiVCQyU4OCVFNCVCOCU4MCVFOCVBMSU4QyVFNCVCOCU4MCVFNCVCOCVBQSVFOCU4QSU4MiVFNyU4MiVCOSVFOSU5MyVCRSVFNiU4RSVBNSVFNSU4RCVCMyVFNSU4RiVBRiVFRiVCQyU4OSVFRiVCQyU5QQp2bGVzcyUzQSUyRiUyRjI0NmFhNzk1LTA2MzctNGY0Yy04ZjY0LTJjOGZiMjRjMWJhZCU0MDEyNy4wLjAuMSUzQTEyMzQlM0ZlbmNyeXB0aW9uJTNEbm9uZSUyNnNlY3VyaXR5JTNEdGxzJTI2c25pJTNEVEcuQ01MaXVzc3NzLmxvc2V5b3VyaXAuY29tJTI2YWxsb3dJbnNlY3VyZSUzRDElMjZ0eXBlJTNEd3MlMjZob3N0JTNEVEcuQ01MaXVzc3NzLmxvc2V5b3VyaXAuY29tJTI2cGF0aCUzRCUyNTJGJTI1M0ZlZCUyNTNEMjU2MCUyM0NGbmF0CnRyb2phbiUzQSUyRiUyRmFhNmRkZDJmLWQxY2YtNGE1Mi1iYTFiLTI2NDBjNDFhNzg1NiU0MDIxOC4xOTAuMjMwLjIwNyUzQTQxMjg4JTNGc2VjdXJpdHklM0R0bHMlMjZzbmklM0RoazEyLmJpbGliaWxpLmNvbSUyNmFsbG93SW5zZWN1cmUlM0QxJTI2dHlwZSUzRHRjcCUyNmhlYWRlclR5cGUlM0Rub25lJTIzSEsKc3MlM0ElMkYlMkZZMmhoWTJoaE1qQXRhV1YwWmkxd2IyeDVNVE13TlRveVJYUlFjVzQyU0ZscVZVNWpTRzlvVEdaVmNFWlJkMjVtYWtORFVUVnRhREZ0U21SRlRVTkNkV04xVjFvNVVERjFaR3RTUzBodVZuaDFielUxYXpGTFdIb3lSbTgyYW5KbmRERTRWelkyYjNCMGVURmxOR0p0TVdwNlprTm1RbUklMjUzRCU0MDg0LjE5LjMxLjYzJTNBNTA4NDElMjNERQoKCiVFOCVBRSVBMiVFOSU5OCU4NSVFOSU5MyVCRSVFNiU4RSVBNSVFNyVBNCVCQSVFNCVCRSU4QiVFRiVCQyU4OCVFNCVCOCU4MCVFOCVBMSU4QyVFNCVCOCU4MCVFNiU5RCVBMSVFOCVBRSVBMiVFOSU5OCU4NSVFOSU5MyVCRSVFNiU4RSVBNSVFNSU4RCVCMyVFNSU4RiVBRiVFRiVCQyU4OSVFRiVCQyU5QQpodHRwcyUzQSUyRiUyRnN1Yi54Zi5mcmVlLmhyJTJGYXV0bw=='))}"
              id="content">${content}</textarea>
            <div class="save-container">
              <button class="save-btn" onclick="saveContent(this)">保存</button>
              <span class="save-status" id="saveStatus"></span>
            </div>
            ` : '<p>请绑定 <strong>变量名称</strong> 为 <strong>KV</strong> 的KV命名空间</p>'}
          </div>
          <br>
          ################################################################<br>
          ${decodeURIComponent(atob('dGVsZWdyYW0lMjAlRTQlQkElQTQlRTYlQjUlODElRTclQkUlQTQlMjAlRTYlOEElODAlRTYlOUMlQUYlRTUlQTQlQTclRTQlQkQlQUMlN0UlRTUlOUMlQTglRTclQkElQkYlRTUlOEYlOTElRTclODklOEMhJTNDYnIlM0UKJTNDYSUyMGhyZWYlM0QlMjdodHRwcyUzQSUyRiUyRnQubWUlMkZDTUxpdXNzc3MlMjclM0VodHRwcyUzQSUyRiUyRnQubWUlMkZDTUxpdXNzc3MlM0MlMkZhJTNFJTNDYnIlM0UKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJTNDYnIlM0UKZ2l0aHViJTIwJUU5JUExJUI5JUU3JTlCJUFFJUU1JTlDJUIwJUU1JTlEJTgwJTIwU3RhciFTdGFyIVN0YXIhISElM0NiciUzRQolM0NhJTIwaHJlZiUzRCUyN2h0dHBzJTNBJTJGJTJGZ2l0aHViLmNvbSUyRmNtbGl1JTJGQ0YtV29ya2Vycy1TVUIlMjclM0VodHRwcyUzQSUyRiUyRmdpdGh1Yi5jb20lMkZjbWxpdSUyRkNGLVdvcmtlcnMtU1VCJTNDJTJGYSUzRSUzQ2JyJTNFCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSUzQ2JyJTNFCiUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMyUyMw=='))}
          <br><br>UA: <strong>${request.headers.get('User-Agent')}</strong>
          <script>
          function copyToClipboard(text, qrcode) {
            navigator.clipboard.writeText(text).then(() => {
              alert('已复制到剪贴板');
            }).catch(err => {
              console.error('复制失败:', err);
            });
            const qrcodeDiv = document.getElementById(qrcode);
            qrcodeDiv.innerHTML = '';
            new QRCode(qrcodeDiv, {
              text: text,
              width: 220,
              height: 220,
              colorDark: "#000000",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.Q,
              scale: 1
            });
          }

          if (document.querySelector('.editor')) {
            let timer;
            const textarea = document.getElementById('content');

            function goBack() {
              const currentUrl = window.location.href;
              const parentUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
              window.location.href = parentUrl;
            }

            function replaceFullwidthColon() {
              const text = textarea.value;
              textarea.value = text.replace(/：/g, ':');
            }

            function saveContent(button) {
              try {
                const updateButtonText = step => {
                  button.textContent = \`保存中: \${step}\`;
                };
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                if (!isIOS) {
                  replaceFullwidthColon();
                }
                updateButtonText('开始保存');
                button.disabled = true;

                const textarea = document.getElementById('content');
                if (!textarea) {
                  throw new Error('找不到文本编辑区域');
                }

                updateButtonText('获取内容');
                let newContent;
                let originalContent;
                try {
                  newContent = textarea.value || '';
                  originalContent = textarea.defaultValue || '';
                } catch (e) {
                  console.error('获取内容错误:', e);
                  throw new Error('无法获取编辑内容');
                }

                updateButtonText('准备状态更新函数');
                const updateStatus = (message, isError = false) => {
                  const statusElem = document.getElementById('saveStatus');
                  if (statusElem) {
                    statusElem.textContent = message;
                    statusElem.style.color = isError ? 'red' : '#666';
                  }
                };

                updateButtonText('准备按钮重置函数');
                const resetButton = () => {
                  button.textContent = '保存';
                  button.disabled = false;
                };

                if (newContent !== originalContent) {
                  updateButtonText('发送保存请求');
                  fetch(window.location.href, {
                    method: 'POST',
                    body: newContent,
                    headers: {
                      'Content-Type': 'text/plain;charset=UTF-8'
                    },
                    cache: 'no-cache'
                  })
                  .then(response => {
                    updateButtonText('检查响应状态');
                    if (!response.ok) {
                      throw new Error(\`HTTP error! status: \${response.status}\`);
                    }
                    updateButtonText('更新保存状态');
                    const now = new Date().toLocaleString();
                    document.title = \`编辑已保存 \${now}\`;
                    updateStatus(\`已保存 \${now}\`);
                  })
                  .catch(error => {
                    updateButtonText('处理错误');
                    console.error('Save error:', error);
                    updateStatus(\`保存失败: \${error.message}\`, true);
                  })
                  .finally(() => {
                    resetButton();
                  });
                } else {
                  updateButtonText('检查内容变化');
                  updateStatus('内容未变化');
                  resetButton();
                }
              } catch (error) {
                console.error('保存过程出错:', error);
                button.textContent = '保存';
                button.disabled = false;
                const statusElem = document.getElementById('saveStatus');
                if (statusElem) {
                  statusElem.textContent = \`错误: \${error.message}\`;
                  statusElem.style.color = 'red';
                }
              }
            }

            textarea.addEventListener('blur', saveContent);
            textarea.addEventListener('input', () => {
              clearTimeout(timer);
              timer = setTimeout(saveContent, 5000);
            });
          }

          function toggleNotice() {
            const noticeContent = document.getElementById('noticeContent');
            const noticeToggle = document.getElementById('noticeToggle');
            if (noticeContent.style.display === 'none' || noticeContent.style.display === '') {
              noticeContent.style.display = 'block';
              noticeToggle.textContent = '隐藏访客订阅∧';
            } else {
              noticeContent.style.display = 'none';
              noticeToggle.textContent = '查看访客订阅∨';
            }
          }

          document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('noticeContent').style.display = 'none';
          });
          </script>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
    });
  } catch (error) {
    console.error('处理请求时发生错误:', error);
    return new Response(`服务器错误: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });
  }
}

<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نوفا AI - الإصدار النهائي المتكامل</title>
    <style>
        /* العناوين العامة والتصميم البدائي الاحترافي (Retro Brutalism) */
        body {
            font-family: 'Courier New', Courier, monospace, Arial;
            background-color: #f0f0f0;
            color: #000;
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        /* 1. شاشة القفل والباسورد المتطورة */
        #lockScreen {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            transition: transform 0.6s cubic-bezier(0.77, 0, 0.175, 1);
        }

        .lock-box {
            border: 3px solid #000;
            padding: 30px;
            background: #fffdf0;
            box-shadow: 8px 8px 0px #000;
            text-align: center;
            width: 90%;
            max-width: 360px;
            animation: bounceIn 0.6s ease;
            box-sizing: border-box;
        }

        .lock-box h2 {
            margin-top: 0;
            font-size: 1.6rem;
        }

        .lock-box input {
            width: 100%;
            padding: 12px;
            font-size: 1.2rem;
            text-align: center;
            border: 2px solid #000;
            margin-top: 15px;
            outline: none;
            box-sizing: border-box;
            background: #fff;
        }

        .lock-box button {
            margin-top: 20px;
            padding: 12px;
            font-size: 1.1rem;
            background: #00ff66;
            border: 2px solid #000;
            cursor: pointer;
            box-shadow: 4px 4px 0px #000;
            font-weight: bold;
            width: 100%;
            box-sizing: border-box;
        }

        .lock-box button:active {
            transform: translate(4px, 4px);
            box-shadow: 0px 0px 0px #000;
        }

        /* 2. الواجهة الرئيسية للموقع (نوفا AI) */
        #mainApp {
            display: none; /* مخفي لحين كتابة الباسورد الصحيح */
            width: 95%;
            max-width: 800px;
            border: 3px solid #000;
            background: #fff;
            box-shadow: 10px 10px 0px #000;
            height: 85vh;
            flex-direction: column;
            opacity: 0;
            transform: scale(0.9);
            transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .header {
            background: #00ffff;
            padding: 15px;
            border-bottom: 3px solid #000;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        /* 3. مجسم الروبوت الاحترافي والتفاعلي */
        .robot-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-left: 10px;
        }

        .robot {
            width: 50px;
            height: 45px;
            background: #000;
            border-radius: 10px;
            position: relative;
            animation: float 2.5s ease-in-out infinite;
            transition: background-color 0.3s ease;
        }

        .robot::before { /* عيون النيون المتفاعلة */
            content: '';
            position: absolute;
            top: 15px; left: 8px;
            width: 8px; height: 8px;
            background: #00ff66;
            border-radius: 50%;
            box-shadow: 26px 0px 0px #00ff66;
            animation: blink 4s infinite;
            transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }

        .robot::after { /* هوائي الروبوت الميكانيكي */
            content: '';
            position: absolute;
            top: -10px; left: 22px;
            width: 6px; height: 10px;
            background: #000;
        }

        /* تغيير الأنميشن والألوان حسب حالة الروبوت */
        .robot.thinking {
            animation: shake 0.15s infinite !important;
            background: #ff0055;
        }
        .robot.thinking::before {
            background: #fff;
            box-shadow: 26px 0px 0px #fff;
        }
        
        .robot.listening {
            animation: pulse 0.5s infinite !important;
            background: #0055ff;
        }
        .robot.listening::before {
            background: #00ffff;
            box-shadow: 26px 0px 0px #00ffff;
        }

        /* 4. منطقة الشات وتدفق الرسائل */
        .chat-box {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #fafafa;
            border-bottom: 3px solid #000;
        }

        .message {
            margin-bottom: 15px;
            padding: 12px 18px;
            border: 2px solid #000;
            max-width: 75%;
            box-shadow: 4px 4px 0px #000;
            animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            font-size: 1rem;
            word-wrap: break-word;
        }

        .user-msg {
            background: #fffdf0;
            float: right;
            clear: both;
        }

        .bot-msg {
            background: #e6f7ff;
            float: left;
            clear: both;
        }

        /* 5. لوحة الإدخال السفلية والأزرار الاختيارية */
        .input-area {
            padding: 15px;
            display: flex;
            gap: 10px;
            background: #fff;
            align-items: center;
        }

        .input-area textarea {
            flex: 1;
            height: 50px;
            border: 2px solid #000;
            padding: 12px;
            resize: none;
            font-size: 1rem;
            font-family: inherit;
            outline: none;
            box-sizing: border-box;
        }

        .btn {
            height: 50px;
            padding: 0 22px;
            font-weight: bold;
            font-size: 1rem;
            border: 2px solid #000;
            cursor: pointer;
            box-shadow: 3px 3px 0px #000;
            transition: all 0.1s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .btn:active {
            transform: translate(3px, 3px);
            box-shadow: 0px 0px 0px #000;
        }

        .btn-send { background: #00ff66; }
        .btn-voice { background: #ffcc00; }

        /* مكتبة الحركات والأنميشن (Keyframes) */
        @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }
        @keyframes blink {
            0%, 90%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.1); }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-3px); }
            75% { transform: translateX(3px); }
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.08); }
            100% { transform: scale(1); }
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>

<div id="lockScreen">
    <div class="lock-box">
        <h2>🔒 نظام نوفا AI مُغلق</h2>
        <p>يرجى إدخال كلمة المرور لتفعيل بيئة بناء المواقع</p>
        <input type="password" id="passInput" placeholder="كلمة المرور الافتراضية 1234">
        <br>
        <button onclick="checkPassword()">تشغيل النظام 🚀</button>
    </div>
</div>

<div id="mainApp">
    <div class="header">
        <div>
            <h2 style="margin:0; font-size: 1.5rem;">نوفا AI 🤖 ✨</h2>
            <small>نظام تحويل الأفكار والنصوص إلى مواقع ويب حقيقية</small>
        </div>
        <div class="robot-container">
            <div id="novaRobot" class="robot"></div>
        </div>
    </div>

    <div class="chat-box" id="chatBox">
        <div class="message bot-msg">أهلاً بك في منصة <b>نوفا AI</b>! أنا هنا لأقوم بتحويل أي فكرة تخطر ببالك إلى موقع إلكتروني حقيقي. يمكنك الكتابة أو الضغط على زر <b>"فويس"</b> للتحدث مباشرة بصوتك! 🛠️</div>
    </div>

    <div class="input-area">
        <textarea id="userInput" placeholder="تكلم أو اكتب هنا، مثال: صمم لي صفحة هبوط لشركة مقاولات باللون الأزرق والأبيض..."></textarea>
        <button class="btn btn-voice" id="voiceBtn" onclick="toggleVoice()">🎙️ فويس</button>
        <button class="btn btn-send" onclick="sendMessage()">إرسال ⚡</button>
    </div>
</div>

<script>
    // --- 1. التحقق من كلمة المرور وأنيميشن الدخول السلس ---
    function checkPassword() {
        const passwordField = document.getElementById('passInput');
        if (passwordField.value === "1234") {
            const lock = document.getElementById('lockScreen');
            // تأثير سحب الشاشة لأعلى
            lock.style.transform = 'translateY(-100%)';
            
            setTimeout(() => {
                lock.style.display = 'none';
                const app = document.getElementById('mainApp');
                app.style.display = 'flex';
                
                // أنيميشن تمدد وتكبير نافذة الشات الرئيسية عند الظهور
                setTimeout(() => {
                    app.style.opacity = '1';
                    app.style.transform = 'scale(1)';
                }, 50);
            }, 600);
        } else {
            alert("❌ كلمة المرور غير صحيحة! جرب الكود التجريبي: 1234");
            passwordField.value = "";
            passwordField.focus();
        }
    }

    // تفعيل الدخول عند ضغط زر Enter من لوحة المفاتيح
    document.getElementById('passInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });

    // --- 2. معالجة الرسائل وأنيميشن الروبوت التفاوضي والذكاء الاصطناعي ---
    function sendMessage() {
        const input = document.getElementById('userInput');
        const text = input.value.trim();
        if (text === "") return;

        const chatBox = document.getElementById('chatBox');
        const robot = document.getElementById('novaRobot');

        // طباعة رسالة المستخدم في صندوق الدردشة
        chatBox.innerHTML += `<div class="message user-msg">${text}</div>`;
        input.value = "";
        chatBox.scrollTop = chatBox.scrollHeight;

        // تفعيل أنيميشن "التفكير والبرمجة" للروبوت (الاهتزاز السريع والتحول للون الأحمر النيون)
        robot.className = "robot thinking";

        // محاكاة استجابة الخادم وتوليد الأكواد (بعد ثانيتين)
        setTimeout(() => {
            robot.className = "robot"; // إعادة الأنميشن الطبيعي (العائم)
            
            chatBox.innerHTML += `
                <div class="message bot-msg">
                    <strong>⚙️ ذكاء نوفا المولد يحاكي فكرتك الآن:</strong><br>
                    تم تحليل طلبك لبناء الموقع الخاص بـ: "${text}" بنجاح.<br><br>
                    <span style="color: #00aa44; font-weight: bold;">[✓] جرى إنشاء الهيكل البنائي بنجاح (index.html)!</span><br>
                    <span style="color: #00aa44; font-weight: bold;">[✓] جرى حقن التنسيقات المتجاوبة (style.css)!</span><br><br>
                    <button onclick="alert('جاري ضغط وتحميل ملفات موقعك الحقيقي المصمم بواسطة نوفا AI...')" style="margin-top:5px; background:#00ffff; border:2px solid #000; padding:8px 12px; font-weight:bold; cursor:pointer; box-shadow: 2px 2px 0px #000; font-family:inherit;">تحميل مجلد الموقع الجاهز 📂</button>
                </div>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 2000);
    }

    // تفعيل الإرسال للمقالات الطويلة عبر اختصار Ctrl + Enter أو Enter العادي
    document.getElementById('userInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // --- 3. تقنية التعرف على الصوت الحية وتحويلها إلى نصوص (Voice-to-Text) ---
    let recognition;
    let isListening = false;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA'; // تهيئة النظام ليفهم الكلمات واللكنات العربية بكل دقة
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        // عند بدء التقاط الصوت من المايكروفون
        recognition.onstart = function() {
            isListening = true;
            const voiceBtn = document.getElementById('voiceBtn');
            voiceBtn.innerText = "🛑 إلغاء";
            voiceBtn.style.background = "#ff0055";
            voiceBtn.style.color = "#fff";
            // تحويل أنيميشن الروبوت إلى "حالة الاستماع النشط" (النبض التوسيعي باللون الأزرق)
            document.getElementById('novaRobot').className = "robot listening";
        };

        // عند معالجة الصوت بنجاح وتحويله إلى نص مقروء
        recognition.onresult = function(event) {
            const resultText = event.results[0][0].transcript;
            const inputField = document.getElementById('userInput');
            // دمج النص الجديد مع النص القديم إن وجد لعدم مسح البيانات
            if (inputField.value.trim() !== "") {
                inputField.value += " " + resultText;
            } else {
                inputField.value = resultText;
            }
        };

        // في حال حدوث خطأ أو انتهاء التحدث تلقائياً
        recognition.onerror = function() {
            stopVoiceConfiguration();
        };

        recognition.onend = function() {
            stopVoiceConfiguration();
        };
    } else {
        // حماية برمجية في حال استخدام متصفحات قديمة أو غير متوافقة
        const vBtn = document.getElementById('voiceBtn');
        vBtn.disabled = true;
        vBtn.innerText = "غير مدعوم";
        vBtn.style.background = "#ccc";
        vBtn.style.cursor = "not-allowed";
    }

    function toggleVoice() {
        if (!recognition) return;
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    }

    function stopVoiceConfiguration() {
        isListening = false;
        const voiceBtn = document.getElementById('voiceBtn');
        voiceBtn.innerText = "🎙️ فويس";
        voiceBtn.style.background = "#ffcc00";
        voiceBtn.style.color = "#000";
        document.getElementById('novaRobot').className = "robot";
    }
</script>

</body>
</html>
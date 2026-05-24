<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <title>NovaClip</title>
</head>
<body>
  <h1>مرحبًا بك في نوفا كليب 🎬</h1>
  <p>ارفع صورة أو ملف صوتي وجرب الذكاء الاصطناعي</p>

  <!-- نموذج رفع ملف -->
  <form id="uploadForm" enctype="multipart/form-data">
    <input type="file" name="file" id="fileInput" />
    <button type="submit">إرسال</button>
  </form>

  <!-- مكان عرض النتيجة -->
  <div id="result"></div>

  <script>
    const form = document.getElementById("uploadForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById("fileInput");
      const formData = new FormData();
      formData.append("file", fileInput.files[0]);

      // هنا تستبدل الرابط برابط الـ API الخاص بك
      const response = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      document.getElementById("result").innerText = JSON.stringify(result, null, 2);
    });
  </script>
</body>
</html>

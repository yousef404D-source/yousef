<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Test Page</title>

  <style>
    *{
      margin:0;
      padding:0;
      box-sizing:border-box;
    }

    body{
      font-family:Arial, sans-serif;
      background:#0f172a;
      color:white;
      height:100vh;
      display:flex;
      justify-content:center;
      align-items:center;
    }

    .card{
      width:400px;
      background:#111827;
      border:1px solid rgba(255,255,255,0.1);
      border-radius:20px;
      padding:30px;
      text-align:center;
      box-shadow:0 0 40px rgba(0,0,0,0.4);
    }

    h1{
      font-size:32px;
      margin-bottom:15px;
    }

    p{
      color:#9ca3af;
      margin-bottom:25px;
      line-height:1.6;
    }

    button{
      padding:14px 24px;
      border:none;
      border-radius:12px;
      background:linear-gradient(135deg,#3b82f6,#8b5cf6);
      color:white;
      font-size:16px;
      cursor:pointer;
      transition:0.3s;
    }

    button:hover{
      transform:scale(1.05);
    }

    .status{
      margin-top:20px;
      font-size:14px;
      color:#22c55e;
    }
  </style>
</head>
<body>

  <div class="card">
    <h1>AI Bot Test</h1>

    <p>
      This is a clean test page to check if the AI website generator is working correctly.
    </p>

    <button id="testBtn">
      Click Me
    </button>

    <div class="status" id="status">
      Waiting...
    </div>
  </div>

  <script>
    const button = document.getElementById("testBtn");
    const status = document.getElementById("status");

    button.addEventListener("click", () => {
      status.textContent = "Bot is working successfully!";
    });
  </script>

</body>
</html>
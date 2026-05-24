import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const idea = body.idea;

    // 🧠 AI GENERATED HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${idea}</title>

        <style>

          body{
            margin:0;
            font-family:Arial;
            background:#0f172a;
            color:white;
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
            overflow:hidden;
          }

          .card{
            width:700px;
            padding:50px;
            border-radius:30px;
            background:rgba(255,255,255,0.08);
            backdrop-filter:blur(20px);
            border:1px solid rgba(255,255,255,0.1);
            animation:fade 1s ease;
            text-align:center;
          }

          h1{
            font-size:55px;
            margin-bottom:20px;
          }

          p{
            opacity:0.7;
            line-height:1.7;
            font-size:20px;
          }

          button{
            margin-top:30px;
            padding:16px 30px;
            border:none;
            border-radius:15px;
            background:white;
            font-size:18px;
            cursor:pointer;
            font-weight:bold;
          }

          @keyframes fade{
            from{
              opacity:0;
              transform:translateY(30px);
            }

            to{
              opacity:1;
              transform:translateY(0px);
            }
          }

        </style>
      </head>

      <body>

        <div class="card">

          <h1>
            ${idea}
          </h1>

          <p>
            This website was generated
            with NOVA CLIP AI.
          </p>

          <button>
            Get Started
          </button>

        </div>

      </body>
      </html>
    `;

    return NextResponse.json({
      html,
    });

  } catch (error) {

    return NextResponse.json({
      error: "Generation Failed",
    });

  }
}
// app/page.tsx
export default function Home() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>NovaClip 🎬</h1>
      <p>تجربة بسيطة للتأكد أن البوت شغال</p>

      <form>
        <input type="file" name="file" />
        <button type="submit">إرسال</button>
      </form>

      <div style={{ marginTop: "20px" }}>
        <p>هنا رح تظهر النتيجة لاحقًا...</p>
      </div>
    </div>
  );
}

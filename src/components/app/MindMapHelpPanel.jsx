export default function MindMapHelpPanel() {
  return (
    <article className="panel">
      <header className="panel-header panel-header-compact">
        <div>
          <p className="eyebrow">Пояснення</p>
          <h2>Як читати стрілочки</h2>
        </div>
      </header>
      <div className="mindmap-help">
        <p>Стрілка показує напрямок взаємодії між двома вузлами.</p>
        <p>Колір і стиль лінії підказують тип зв&apos;язку: підпорядкування, координація, нагляд, сервіс або правова основа.</p>
        <p>Натисніть на стрілку, щоб побачити її пояснення та джерела для перевірки.</p>
      </div>
    </article>
  );
}

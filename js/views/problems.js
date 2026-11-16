// Problem finder. Content follows in phase 4.

export function problemsView() {
  return {
    title: 'Problemfinder',
    html: `
      <header class="lesson-head">
        <h2>Was passiert dir?</h2>
        <p class="lead">Wähle ein Problem und du bekommst Ursache, Sofort-Tipp und eine passende Übung.</p>
      </header>
      <div class="card soon">
        <b>Kommt bald</b>
        <p>Zum Beispiel: „Ich werde auf Rot zu schnell“, „Ich lande immer im Pflug“ oder „Ich bin in Rücklage“.</p>
      </div>
    `,
  };
}

// The pages a route change can bring in. Only the current page is ever in the document: the home page ships in the
// HTML (so it reads without script and paints first), the others arrive from here behind the shut curtain, the way a
// transition library swaps in the next page's container.
export const ROUTES = {
  stay: {
    title: 'Stay',
    html: `
    <article class="wrap view" data-route="stay">
      <p class="label">/ page 2 of 3</p>
      <h1 class="title" tabindex="-1">Rooms in<br>the ridge.</h1>
      <p class="lede">Scroll down, go to the journal, then press back: this page returns to where you left it. Follow a link to it instead and it opens at the top.</p>
      <ol class="rooms">
        <li><h2>North room</h2><p>Two windows on the ridge, a desk under the eaves, the morning on the left wall.</p></li>
        <li><h2>Stream room</h2><p>Lower and quieter, the water audible with the window shut, a bath set into the floor.</p></li>
        <li><h2>Loft</h2><p>A ladder, a skylight, room for two and nothing else; the stars do the rest.</p></li>
        <li><h2>Long room</h2><p>For six, around one table the length of the room, with the valley at one end.</p></li>
      </ol>
      <p class="next"><a href="#/journal" data-nav>Next: Journal →</a></p>
    </article>`,
  },
  journal: {
    title: 'Journal',
    html: `
    <article class="wrap view" data-route="journal">
      <p class="label">/ page 3 of 3</p>
      <h1 class="title" tabindex="-1">Notes from<br>the build.</h1>
      <ol class="entries">
        <li><p class="label">March</p><p>The ground is open and the first stones are back on site, numbered, in the order they came out.</p></li>
        <li><p class="label">May</p><p>The roof line is up. From the road it is shorter than the drawings, which is what we wanted.</p></li>
        <li><p class="label">August</p><p>Windows in, the first night with the stove lit; the chimney draws on the second try.</p></li>
        <li><p class="label">October</p><p>Snow on the upper path before the paint is dry; the work moves inside for the winter.</p></li>
      </ol>
      <p class="next"><a href="#/home" data-nav>Back to the valley →</a></p>
    </article>`,
  },
};

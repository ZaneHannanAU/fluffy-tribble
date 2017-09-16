const voter = document.getElementById('voter')
const result= document.getElementById('result')
const pollView = document.getElementById('poll-view')
const errs = document.getElementById('errs')
const tdisable = b => {
  voter.disabled = b
  Array.from(voter.children).forEach(el => el.disabled = b)
}

voter.addEventListener('submit', e => {
  e.preventDefault()
  tdisable(true)
  fetch('http://kirby-poll.us-west-2.elasticbeanstalk.com/votes/kirby', {
    method: 'PUT',
    body: JSON.stringify({
      vote: document.getElementById('vote').value,
      nextVote: Math.floor(Math.random()*1e3) // random millisecond value
        + 864e5 // 1 day
        + new Date(new Date().toISOString().slice(0,10)).valueOf()
        // it works lol
    }),
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'Origin': 'http://kirby.nintendo.com',
      'User-Agent': 'Mz',
      'Referer': 'http://kirby.nintendo.com/battle-royale/',
      'DNT': 1
    }
  })
  .then(r => (console.log(r), r.json()))
  .then(j => {
    console.log(j)
    result.insertAdjacentText(
      'beforeend',
      '\n' + JSON.stringify(j, null, 2)
    )
  })
  .catch(e => errs.insertAdjacentText('beforeend', '\n' + e.stack))
  .then(() => tdisable(false))
  .then(() => document.getElementById('vote').focus())
})

const poll = () => {
  fetch('http://kirby-poll.us-west-2.elasticbeanstalk.com/votes/kirby')
  .then(r => (console.log(r), r.json()))
  .then(j => {
    console.log(j);
    pollView.innerHTML = ''
    for (const {tally, option} of j.sort((b, a) => (a.tally - b.tally)))
      pollView.appendChild(document.createElement('li'))
      .innerText = String(tally + ': ' + option)
  })
  .catch(e => errs.insertAdjacentText('beforeend', '\n' + e.stack))

  return poll
}

setInterval(poll(), 3e4)

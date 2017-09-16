const voter = document.getElementById('voter')
const result= document.getElementById('result')
const pollView = document.getElementById('poll-view')

voter.addEventListener('submit', e => {
  e.preventDefault()
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
})

const poll = () => fetch('http://kirby-poll.us-west-2.elasticbeanstalk.com/votes/kirby')
.then(r => (console.log(r), r.json()))
.then(j => {
  console.log(j);
  pollView.innerHTML = ''
  for (const {tally, option} of j.sort((b, a) => a.tally - b.tally))
    pollView.appendChild(document.createElement('li'))
    .innerText = String(tally + ': ' + option)
})
poll()

setInterval(poll, 3e5)

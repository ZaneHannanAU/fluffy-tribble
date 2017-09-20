const voter = document.getElementById('voter')
const result= document.getElementById('result')
const pollView = document.getElementById('poll-view')
const errs = document.getElementById('errs')
const int = {
  re: /^\+?(0x[0-9A-Fa-f][0-9A-Fa-f_ ]+|0b[01][01_ ]+|[0-9][0-9_ ]*|0o[0-7][0-7_ ]+|[1-9][0-9_ ]*(?:e[+-]?[1-9][0-9_ ]+))|\+?([1-9][0-9_ ]*(?::[0-5]?[0-9])+)$/,
  rp(m, n, s) {
    if (n) return Number(n.replace(/[_ ]/g, ''))
    else return s
      .replace(/[_ ]/g, '')
      .split(':')
      .reduce((acc, v) => acc * 60 + parseInt(v, 10), 0)
  }
}

const tdisable = b => {
  voter.disabled = b
  Array.from(voter.children).forEach(el => el.disabled = b)
}

const submit = (
  vote = String(document.getElementById('vote').value), i = 1
) => fetch('http://kirby-poll.us-west-2.elasticbeanstalk.com/votes/kirby', {
  method: 'PUT',
  body: JSON.stringify({
    vote,
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
  if (j.error) {
    let e = new Error(j.error)
    throw e
  }
  result.insertAdjacentText(
    'beforeend',
    '\n' + JSON.stringify(j, null, 0)
  )
  if (i-1 > 0) return submit(vote, i-1)
})
.catch(e => errs.insertAdjacentText('beforeend', '\n' + e.stack))

voter.addEventListener('submit', e => {
  e.preventDefault()
  tdisable(true)
  submit(
    String(document.getElementById('vote').value),
    parseInt(
      String(document.getElementById('times').value).replace(int.re, int.rp),
      10
    )
  )
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

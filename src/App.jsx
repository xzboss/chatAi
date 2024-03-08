import React, { useState, useEffect, useRef } from 'react';
import { TextField, InputAdornment, Grid, Box, Button } from '@mui/material';
import { ArrowCircleUp, SentimentSatisfiedAlt, SmartToy } from '@mui/icons-material';

import { send } from './api'
import './App.css';

function App () {
  const [msg, setMsg] = useState('')
  const [key, setKey] = useState('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')
  const [claName, setClaName] = useState('in')
  const [msgArr, setMsgArr] = useState([])
  const chatRef = useRef(null)
  let personScroll = useRef(false)
  let ing = useRef(false)

  function handleChange (e) {
    setMsg(e.target.value)
  }
  function handleChangeKey (e) {
    setKey(e.target.value)
  }

  // 处理滚动条
  function scrollBottom () {
    if (personScroll.current) return
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }

  useEffect(() => {
    chatRef.current.addEventListener('wheel', () => {
      personScroll.current = true
    })
  }, [])

  // 发送
  async function handleSend () {
    if (msg.trim() === '' || ing.current) return
    ing.current = true
    personScroll.current = false
    msgArr.push({ role: 'user', content: msg })
    const data = await send(key, msgArr)
    if (data.status !== 200) {
      return msgArr.pop()
    }

    // 处理数据流
    const reader = data.body.getReader()
    const decoder = new TextDecoder()
    let answer = ''
    msgArr.push({ role: 'assistant', content: answer })
    const timer = setInterval(async () => {
      const { done, value } = await reader.read()
      if (done) {
        clearInterval(timer)
        ing.current = false
      }
      const str = decoder.decode(value)
      answer += /"content":"(.*?)"/.exec(str.trim())?.[1] || ''
      msgArr[msgArr.length - 1].content = answer.replace(/\\n/g, "\n")
      setMsgArr([...msgArr])
      scrollBottom()
    }, 10);
  }



  return (
    <div className="App">
      <Box sx={{ flexGrow: 1 }} className="chat-container" ref={chatRef} >
        {msgArr.map((item, index) => {
          return <Grid spacing={1} container key={index} className={`${item.role}-msg msg-item`}>
            <Grid item xs={2} md={1} className='avatar'>
              {item.role === 'user' ? <SentimentSatisfiedAlt fontSize='large' /> : <SmartToy fontSize='large' />}
            </Grid>
            <Grid item xs={10} md={11} className='name'>
              {item.role === 'user' ? 'You' : 'Ai'}
            </Grid>
            <Grid item xs={2} md={1}></Grid>
            <Grid item xs={10} md={11} className='msg-content'>
              {item.content}
            </Grid>
          </Grid>

        })}</Box>

      <div className="input-area">
        <TextField
          fullWidth
          id="fullWidth"
          onInput={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment
                position="end"
                className='btn-send'
                onClick={handleSend}>
                <ArrowCircleUp fontSize='large' />
              </InputAdornment>
            ),
          }}>
        </TextField>
      </div>

      <Button className={'btn-key ' + claName} onClick={() => { setClaName(claName === 'in' ? 'out' : 'in') }}>change-key</Button>
      <TextField
        fullWidth
        id="fullWidth"
        onInput={handleChangeKey}
        className={claName + ' key-input'}
        defaultValue={'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'}>
      </TextField>
    </div>
  );
}

export default App;

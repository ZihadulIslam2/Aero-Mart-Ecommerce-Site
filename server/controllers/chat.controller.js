import axios from 'axios'

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body

    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'tinyllama',
      prompt: message,
      stream: false,
    })

    res.json({
      reply: response.data.response,
    })
  } catch (error) {
    res.status(500).json({ error: 'AI response failed' })
  }
}

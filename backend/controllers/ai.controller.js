import axios from "axios";

export const chatWithMistral = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: "mistral-tiny", // or "mistral-small" / "mistral-medium"
        messages: [
          { role: "system", content: "You are a helpful assistant that generates social media captions and chats." },
          { role: "user", content: message }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiReply = response.data.choices[0].message.content;
    return res.status(200).json({ reply: aiReply });
  } catch (error) {
    console.error("Mistral API error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to get response from AI" });
    

  }
 

};

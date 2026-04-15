def enhance_text_for_emotion(text, emotion):
    text = text.strip()

    if emotion == "joy":
        text = f"Wow! {text}!"
        text = text.replace(".", "!")
    
    elif emotion == "sadness":
        text = text.replace(",", "... ")
        text = f"{text}..."
    
    elif emotion == "anger":
        text = text.upper()
        text = text + "!"
    
    elif emotion == "fear":
        text = f"Uh... {text}"
        text = text.replace(".", "...")

    elif emotion == "neutral":
        pass

    return text


def add_pauses(text, emotion):
    if emotion == "sadness":
        return text.replace(" ", "... ")
    
    elif emotion == "fear":
        return text.replace(" ", " ... ")
    
    elif emotion == "joy":
        return text.replace(",", ", ")
    
    return text
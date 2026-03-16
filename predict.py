import joblib

model = joblib.load("sqli_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

def detect_sqli(input_text):
    vec = vectorizer.transform([input_text])
    prediction = model.predict(vec)

    if prediction[0] == 1:
        return "SQL Injection Detected"
    else:
        return "Safe Input"

# Example test
while True:
    user_input = input("Enter query: ")
    print(detect_sqli(user_input))

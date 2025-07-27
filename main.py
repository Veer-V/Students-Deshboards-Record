# Save this as `app.py`

import streamlit as st
import pandas as pd
import joblib

def generate_tip(student_data):
    tips = []
    if student_data["Attendance_Percentage"] < 60:
        tips.append("Improve attendance.")
    if student_data["Internal_Assessment_1"] < 15:
        tips.append("Focus on Internal 1 topics.")
    if student_data["Participation_Score"] < 5:
        tips.append("Engage more in class.")
    return " | ".join(tips) if tips else "You're on track!"
    
# Load model and data
model = joblib.load("model_pipeline.pkl")  # save model earlier using joblib
df = pd.read_csv("student_performance_60.csv")

st.title("🎓 Student Performance Dashboard")

selected_student = st.selectbox("Select Student", df["Name"])

student_data = df[df["Name"] == selected_student].iloc[0]
features = [[
    student_data["Internal_Assessment_1"],
    student_data["Internal_Assessment_2"],
    student_data["Attendance_Percentage"],
    student_data["Previous_Semester_Grade"],
    student_data["Participation_Score"]
]]

prediction = model.predict(features)[0]
result = "✅ Pass" if prediction >= 15 else "❌ Fail"

st.subheader(f"Result: {result}")
st.write(f"📊 Recommendation: {generate_tip(student_data)}")

st.write("📋 Student Details", student_data)

uploaded_file = st.file_uploader("Upload updated student data CSV")
if uploaded_file is not None:
    df = pd.read_csv(uploaded_file)
    st.success("Data updated successfully!")
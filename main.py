# Save this as `app.py`

import streamlit as st
import pandas as pd
import joblib

def generate_tip(student_data):
    if student_data["Attendance_Percentage"] < 75:
        return "Improve attendance to at least 75%."
    elif student_data["Internal_Assessment_1"] < 20 or student_data["Internal_Assessment_2"] < 20:
        return "Focus on improving internal assessment scores."
    elif student_data["Participation_Score"] < 1:
        return "Increase participation in class activities."
    else:
        return "Keep up the good work!"
    
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
result = "✅ Pass" if prediction == 1 else "❌ Fail"

st.subheader(f"Result: {result}")
st.write(f"📊 Recommendation: {generate_tip(student_data)}")

st.write("📋 Student Details", student_data)

uploaded_file = st.file_uploader("Upload updated student data CSV")
if uploaded_file is not None:
    df = pd.read_csv(uploaded_file)
    st.success("Data updated successfully!")
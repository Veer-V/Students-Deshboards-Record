# Save as app.py

import streamlit as st
import pandas as pd
import joblib
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(page_title="Student Dashboard", layout="wide")

# Theme toggle
theme = st.sidebar.radio("Choose Theme", ["🌞 Light", "🌙 Dark"])
custom_color = "#F0F2F6" if theme == "🌞 Light" else "#0E1117"
st.markdown(f"""<style>body{{background-color: {custom_color};}}</style>""", unsafe_allow_html=True)

# Function to generate smart tips
def generate_tip(student_data):
    tips = []
    if student_data["Attendance_Percentage"] < 60:
        tips.append("📌 Improve attendance.")
    if student_data["Internal_Assessment_1"] < 15:
        tips.append("📝 Focus on Internal 1 topics.")
    if student_data["Participation_Score"] < 5:
        tips.append("🙋‍♂️ Engage more in class.")
    return " | ".join(tips) if tips else "🎯 You're on track!"

# Load model and data
model = joblib.load("model_pipeline.pkl")
df = pd.read_csv("student_performance_60.csv")

st.title("📊 Student Performance Dashboard")
st.markdown("Analyze student progress, identify risks, and provide recommendations.")

# Add overall stats
col1, col2, col3 = st.columns(3)
with col1:
    avg_attendance = round(df["Attendance_Percentage"].mean(), 2)
    st.metric("📅 Avg. Attendance (%)", avg_attendance)
with col2:
    pass_count = sum((model.predict(df[[
        "Internal_Assessment_1", "Internal_Assessment_2",
        "Attendance_Percentage", "Previous_Semester_Grade",
        "Participation_Score"
    ]]) >= 15))
    st.metric("✅ Students Predicted to Pass", pass_count)
with col3:
    st.metric("📈 Dataset Size", len(df))

st.markdown("---")

# Student selection
selected_student = st.selectbox("🎓 Select a Student", df["Name"])

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

# Display result
st.subheader(f"🎯 Prediction Result: {'🟢' if prediction >= 15 else '🔴'} {result}")
st.markdown(f"**💡 Recommendation:** {generate_tip(student_data)}")

# Expandable section
with st.expander("📋 View Student Details"):
    st.dataframe(pd.DataFrame([student_data]))

# --- Performance Breakdown Chart ---
st.markdown("### 📊 Performance Breakdown")
chart_df = pd.DataFrame({
    "Metrics": ["Internal 1", "Internal 2", "Attendance", "Previous Grade", "Participation"],
    "Values": [
        student_data["Internal_Assessment_1"],
        student_data["Internal_Assessment_2"],
        student_data["Attendance_Percentage"],
        student_data["Previous_Semester_Grade"],
        student_data["Participation_Score"]
    ]
})
bar_fig = px.bar(chart_df, x="Metrics", y="Values", color="Values", text="Values", height=350)
st.plotly_chart(bar_fig, use_container_width=True)

# --- Pass/Fail Pie Chart ---
st.markdown("### 🧮 Pass vs Fail Distribution")
predictions = model.predict(df[[
    "Internal_Assessment_1", "Internal_Assessment_2",
    "Attendance_Percentage", "Previous_Semester_Grade",
    "Participation_Score"
]])
pass_fail_counts = pd.Series(["Pass" if x >= 15 else "Fail" for x in predictions]).value_counts()
pie_fig = px.pie(names=pass_fail_counts.index, values=pass_fail_counts.values, title="Pass/Fail Ratio")
st.plotly_chart(pie_fig, use_container_width=True)

# --- Line Chart: Attendance vs. Assessments ---
st.markdown("### 📈 Attendance vs Internal Scores")
line_df = df[["Name", "Attendance_Percentage", "Internal_Assessment_1", "Internal_Assessment_2"]].sort_values(by="Attendance_Percentage")
line_fig = go.Figure()
line_fig.add_trace(go.Scatter(x=line_df["Attendance_Percentage"], y=line_df["Internal_Assessment_1"], mode='lines+markers', name='Internal 1'))
line_fig.add_trace(go.Scatter(x=line_df["Attendance_Percentage"], y=line_df["Internal_Assessment_2"], mode='lines+markers', name='Internal 2'))
line_fig.update_layout(xaxis_title='Attendance (%)', yaxis_title='Assessment Scores')
st.plotly_chart(line_fig, use_container_width=True)

# --- Upload New Data ---
st.markdown("---")
uploaded_file = st.file_uploader("📤 Upload updated student data (.csv)", type=["csv"])
if uploaded_file is not None:
    df = pd.read_csv(uploaded_file)
    st.success("✅ Data updated successfully! Refresh the page to reload.")
    df.to_csv("updated_student_performance.csv", index=False)
    st.write("Updated data saved as 'updated_student_performance.csv'.")

# --- Footer ---
st.markdown("---")

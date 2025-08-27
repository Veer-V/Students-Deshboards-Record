from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load model and data
model = joblib.load("model_pipeline.pkl")
df = pd.read_csv("student_performance_60.csv")

@app.route('/students', methods=['GET'])
def get_students():
    return jsonify(df.to_dict(orient='records'))

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        features = [[
            data['Internal_Assessment_1'],
            data['Internal_Assessment_2'],
            data['Attendance_Percentage'],
            data['Previous_Semester_Grade'],
            data['Participation_Score']
        ]]
        prediction = model.predict(features)[0]
        result = "Pass" if prediction >= 15 else "Fail"
        return jsonify({'prediction': result, 'score': float(prediction)})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/analytics', methods=['GET'])
def get_analytics():
    try:
        # Performance trends (weekly/monthly - using index as time)
        performance_trend = df[['Internal_Assessment_1', 'Internal_Assessment_2']].mean(axis=1).tolist()
        
        # Subject scores
        subject_scores = {
            'Math': float(df['Internal_Assessment_1'].mean()),
            'Science': float(df['Internal_Assessment_2'].mean()),
            'English': float(df['Previous_Semester_Grade'].mean()),
            'History': float(df['Attendance_Percentage'].mean()),
            'Art': float(df['Participation_Score'].mean())
        }
        
        # Attendance distribution
        attendance_distribution = {
            '0-60%': int(((df['Attendance_Percentage'] >= 0) & (df['Attendance_Percentage'] < 60)).sum()),
            '60-70%': int(((df['Attendance_Percentage'] >= 60) & (df['Attendance_Percentage'] < 70)).sum()),
            '70-80%': int(((df['Attendance_Percentage'] >= 70) & (df['Attendance_Percentage'] < 80)).sum()),
            '80-90%': int(((df['Attendance_Percentage'] >= 80) & (df['Attendance_Percentage'] < 90)).sum()),
            '90-100%': int(((df['Attendance_Percentage'] >= 90) & (df['Attendance_Percentage'] <= 100)).sum())
        }
        
        # Predictions
        predictions = model.predict(df[[ 
            'Internal_Assessment_1', 'Internal_Assessment_2',
            'Attendance_Percentage', 'Previous_Semester_Grade',
            'Participation_Score'
        ]])
        pass_fail_distribution = {
            'Pass': int(sum(predictions >= 15)),
            'Fail': int(sum(predictions < 15))
        }
        
        return jsonify({
            'performance_trend': performance_trend,
            'subject_scores': subject_scores,
            'attendance_distribution': attendance_distribution,
            'pass_fail_distribution': pass_fail_distribution
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analytics/<student_name>', methods=['GET'])
def get_student_analytics(student_name):
    try:
        # Find student by name
        student_data = df[df['Name'].str.lower() == student_name.lower()]
        
        if student_data.empty:
            return jsonify({'error': 'Student not found'}), 404
        
        student = student_data.iloc[0]
        
        # Individual student performance data
        individual_performance = {
            'Internal_Assessment_1': float(student['Internal_Assessment_1']),
            'Internal_Assessment_2': float(student['Internal_Assessment_2']),
            'Attendance_Percentage': float(student['Attendance_Percentage']),
            'Previous_Semester_Grade': float(student['Previous_Semester_Grade']),
            'Participation_Score': float(student['Participation_Score'])
        }
        
        # Performance trend for the student (using both internal assessments)
        performance_trend = [
            float(student['Internal_Assessment_1']),
            float(student['Internal_Assessment_2'])
        ]
        
        # Subject scores comparison (student vs class average)
        subject_comparison = {
            'Math': {
                'student': float(student['Internal_Assessment_1']),
                'average': float(df['Internal_Assessment_1'].mean())
            },
            'Science': {
                'student': float(student['Internal_Assessment_2']),
                'average': float(df['Internal_Assessment_2'].mean())
            },
            'English': {
                'student': float(student['Previous_Semester_Grade']),
                'average': float(df['Previous_Semester_Grade'].mean())
            },
            'History': {
                'student': float(student['Attendance_Percentage']),
                'average': float(df['Attendance_Percentage'].mean())
            },
            'Art': {
                'student': float(student['Participation_Score']),
                'average': float(df['Participation_Score'].mean())
            }
        }
        
        # Individual prediction
        student_features = [[
            student['Internal_Assessment_1'],
            student['Internal_Assessment_2'],
            student['Attendance_Percentage'],
            student['Previous_Semester_Grade'],
            student['Participation_Score']
        ]]
        prediction = model.predict(student_features)[0]
        prediction_result = {
            'score': float(prediction),
            'result': "Pass" if prediction >= 15 else "Fail"
        }
        
        # Attendance comparison
        attendance_comparison = {
            'student': float(student['Attendance_Percentage']),
            'average': float(df['Attendance_Percentage'].mean())
        }
        
        return jsonify({
            'student_info': {
                'name': student['Name'],
                'id': student['Student_ID']
            },
            'individual_performance': individual_performance,
            'performance_trend': performance_trend,
            'subject_comparison': subject_comparison,
            'prediction': prediction_result,
            'attendance_comparison': attendance_comparison,
            'class_averages': {
                'Internal_Assessment_1': float(df['Internal_Assessment_1'].mean()),
                'Internal_Assessment_2': float(df['Internal_Assessment_2'].mean()),
                'Attendance_Percentage': float(df['Attendance_Percentage'].mean()),
                'Previous_Semester_Grade': float(df['Previous_Semester_Grade'].mean()),
                'Participation_Score': float(df['Participation_Score'].mean())
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        file = request.files['file']
        if file and file.filename.endswith('.csv'):
            df_new = pd.read_csv(file)
            # Validate required columns
            required_columns = ['Name', 'Internal_Assessment_1', 'Internal_Assessment_2', 
                              'Attendance_Percentage', 'Previous_Semester_Grade', 'Participation_Score']
            if all(col in df_new.columns for col in required_columns):
                df_new.to_csv("updated_student_performance.csv", index=False)
                global df
                df = df_new  # Update the in-memory dataframe
                return jsonify({'message': 'File uploaded successfully! Data updated.'}), 200
            else:
                return jsonify({'message': 'CSV file missing required columns!'}), 400
        return jsonify({'message': 'Invalid file format! Please upload a CSV file.'}), 400
    except Exception as e:
        return jsonify({'message': f'Error processing file: {str(e)}'}), 500

@app.route('/download', methods=['GET'])
def download_file():
    try:
        df.to_csv("current_student_data.csv", index=False)
        return jsonify({'message': 'File ready for download', 'filename': 'current_student_data.csv'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, use_reloader=False)

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'API is working!'})

@app.route('/analytics', methods=['GET'])
def get_analytics():
    # Mock data for testing
    return jsonify({
        'performance_trend': [85, 78, 92, 88, 95],
        'subject_scores': {
            'Math': 85.5,
            'Science': 78.2,
            'English': 92.1,
            'History': 88.7,
            'Art': 95.3
        },
        'attendance_distribution': {
            '(0, 60]': 5,
            '(60, 70]': 10,
            '(70, 80]': 15,
            '(80, 90]': 20,
            '(90, 100]': 10
        },
        'pass_fail_distribution': {
            'Pass': 45,
            'Fail': 15
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000, use_reloader=False)

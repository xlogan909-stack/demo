pipeline {
    agent any

    stages {

        stage("Git Clone") {
            steps {
                git url: "git@github.com:xlogan909-stack/demo.git", branch: "main"
            }
        }

        stage("Build Docker Image") {
            steps {
                sh "docker build -t react-app ."
            }
        }

        stage("Stop Existing Container") {
            steps {
                sh """
                    docker stop react-app || true
                    docker rm react-app || true
                """
            }
        }

        stage("Run Container") {
            steps {
                sh "docker run -d --name react-app -p 5173:5173 react-app"
            }
        }
    }
}
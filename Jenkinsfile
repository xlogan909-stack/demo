pipeline {
    agent any

    stages {

        stage("Git Clone") {
            steps {
                git url: "git@github.com:xlogan909-stack/demo.git", branch: "main"
            }
        }

        stage("setuping docker network"){
            steps{
                sh "docker network inspect my-network >/dev/null 2>&1 || docker network create my-network"
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
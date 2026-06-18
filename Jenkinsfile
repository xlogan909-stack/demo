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
        
        stage("sql connection"){
            steps{
                sh """
                    docker stop mysql || true
                    docker rm mysql || true
                    docker run -d --name mysql \
                        --network my-network \
                        -e MYSQL_ROOT_PASSWORD=root123 \
                        -e MYSQL_DATABASE=mydb \
                        -p 3306:3306 \
                        -v /home/ubuntu/data:/var/lib/mysql \
                        mysql:latest
                """
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
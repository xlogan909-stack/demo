pipeline {
    agent any

    stages {

        stage("Git Clone") {
            steps {
                git url: "git@github.com:xlogan909-stack/demo.git", branch: "main"
            }
        }

        stage("Setup Docker Network") {
            steps {
                sh "docker network inspect my-network >/dev/null 2>&1 || docker network create my-network"
            }
        }

        stage("SQL Connection") {
            steps {
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

        stage("Build Backend") {
            steps {
                sh "docker build -t todo-backend ./backend"
            }
        }

        stage("Deploy Backend") {
            steps {
                sh """
                    docker stop todo-backend || true
                    docker rm todo-backend || true
                    docker run -d --name todo-backend \
                        --network my-network \
                        -e DB_HOST=mysql \
                        -e DB_USER=root \
                        -e DB_PASS=root123 \
                        -e DB_NAME=mydb \
                        -p 5000:5000 \
                        todo-backend
                """
            }
        }

        stage("Build Frontend") {
            steps {
                sh "docker build -t react-app ."
            }
        }

        stage("Deploy Frontend") {
            steps {
                sh """
                    docker stop react-app || true
                    docker rm react-app || true
                    docker run -d --name react-app \
                        --network my-network \
                        -p 5173:5173 \
                        react-app
                """
            }
        }

    }
}

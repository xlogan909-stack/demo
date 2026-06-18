pipeline {
    agent any

    stages {

        stage("Git Clone") {
            steps {
                git url: "git@github.com:xlogan909-stack/demo.git", branch: "main"
            }
        }

    stage("build "){
        steps{
            sh "docker compose down && docker compose up -d "
        }
    }

    }
}

Для старта проекту з використанням Docker Compose:
1. Виконайте команду: `docker-compose up`.
2. Docker Compose запустить всі необхідні сервіси, вказані в `docker-compose.yml` (наприклад, PostgreSQL і Node.js).

Для міграції бази даних:
1. Виконайте команду: `npx mikro-orm migration:up`.
2. Ця команда застосує всі нові міграції до вашої бази даних.

Для скидання останньої міграції:
1. Виконайте команду: `npx mikro-orm migration:down`.
2. Ця команда відкатує останню міграцію бази даних.


# Локальне розгортання в Kubernetes

Цей проект можна запустити в локальному середовищі за допомогою Kubernetes. Ось інструкції, як це зробити.

## 1. Підготовка середовища

### 1.1. Встановлення Docker

Для створення контейнерів та роботи з Kubernetes вам потрібен Docker.

- [Інструкція по встановленню Docker](https://docs.docker.com/get-docker/)

### 1.2. Встановлення Kubernetes

Для локального запуску Kubernetes ми використовуємо [Minikube](https://minikube.sigs.k8s.io/docs/).

- Встановіть Minikube:

```bash
# Для MacOS
brew install minikube

# Для Linux
sudo apt install minikube

# Для Windows
choco install minikube
Запустіть Minikube:
minikube start
1.3. Встановлення kubectl
kubectl — це інтерфейс командного рядка для взаємодії з Kubernetes.

Інструкція по встановленню kubectl
2. Створення Docker-образу

Перш за все, необхідно створити Docker-образ для вашого сервісу. Зазвичай для цього використовується файл Dockerfile.

2.1. Створіть Docker-образ:
Перейдіть до каталогу вашого проєкту та виконайте команду:

docker build -t your-image-name .
Це створить Docker-образ на основі вашого Dockerfile.

3. Налаштування Kubernetes

3.1. Створення файлів конфігурації Kubernetes
Створіть необхідні конфігураційні файли для Kubernetes:

3.1.1. Deployment файл (deployment.yaml)

apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: your-service
  template:
    metadata:
      labels:
        app: your-service
    spec:
      containers:
        - name: your-service
          image: your-image-name:latest
          ports:
            - containerPort: 80
3.1.2. Service файл (service.yaml)

apiVersion: v1
kind: Service
metadata:
  name: your-service
spec:
  selector:
    app: your-service
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 80
  type: LoadBalancer
3.2. Застосування конфігурацій до Kubernetes
Запустіть наступні команди для розгортання вашого сервісу в Kubernetes:

kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
Це створить ваш контейнер в Kubernetes як Deployment і відкриє доступ до нього через сервіс.

4. Перевірка стану розгортання

Щоб перевірити, чи все працює правильно, скористайтеся наступними командами:

4.1. Перевірка стану pod'ів
kubectl get pods
4.2. Перевірка статусу сервісу
kubectl get svc
4.3. Доступ до сервісу
Якщо ви використовуєте Minikube, для того, щоб отримати доступ до сервісу в локальному середовищі, вам потрібно використати команду:

minikube service your-service
Ця команда відкриє ваш сервіс у браузері за допомогою відповідного порту.

5. Логування

Для перегляду логів вашого поду використовуйте команду:

kubectl logs <pod-name>
Замість <pod-name> вставте ім'я вашого pod, яке ви отримали за допомогою команди kubectl get pods.

6. Зупинка Minikube

Після завершення роботи з Kubernetes ви можете зупинити Minikube:

minikube stop
Тепер ви готові до розгортання вашого сервісу в Kubernetes локально!


### Основні моменти:
- Встановлення необхідного ПО (Docker, Minikube, kubectl).
- Створення та налаштування Docker-образу.
- Написання Kubernetes конфігурацій для `Deployment` та `Service`.
- Команди для перевірки стану розгортання та доступу до сервісу.
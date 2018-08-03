## entities-service

## How to setup the environment

### AWS Credentials
You need to create a file in your `~/.aws/credentials` file with the accessKey and secretKey.

Example:
```
[default]
aws_access_key_id = XXXXXXXXXXXXXXXX
aws_secret_access_key = xxxXxXXXXxxXXxxXxXXxxxXXxxXXxxX
```

You can set different profiles for this file and switch between projects. Read more at [Configuring the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html).

### Docker
All the microservices communicate through RabbitMQ. You'll need to run the environments locally using `docker`. You'll find a `docker-compose.dev.yml` file in each project that contains the required dependencies and configs required. 

At the moment, the project that boots up the RabbitMQ instance is this one (entities-service), so you should start your development by running `yarn docker:dev` in the root directory of this file. This will startup three containers:
- A `PostgreSQL database` running on port `5432`
- A `Prisma Cluster` runnning on port `4466`
- A `RabbitMQ Managmement` running on port `15672`
- A `RabbitMQ` instance running on port `5672`

### Setting up Prisma
After the `Prisma Cluster` is up and running, you are not ready to query yet. First, you have to deploy a prisma service running `yarn prisma:deploy`. This command will perform a few tasks:
- Deploy an instance of our service into the cluster
- Configure the database, create tables, etc...
- It will generate the `typescript` interfaces for all the graphql type definitions.

If everything was sucessfull, you should me able to see the schema at http://localhost:4466/graphql. It will open a graphql playground where you can interact with the entities.


### Setting up the server
Now that we have Prisma Cluster up and running and our service deployed, we need o run our server. The Prisma service is actually hidden from the internet and just our servers have access to it. Our server will be responsible to abstract even more the communication with the database (using prisma queries and mutations) and provide just the schema that our application needs.

To get the server started you need to create a config file under `./config/.dev.env` following this format:
```
POSTGRES_URI=postgres://entities:mypass@localhost:5432/entities
RABBITMQ_URI=amqp://guest:guest@localhost:5672
PRISMA_ENDPOINT=http://localhost:4466
```

After that, you should be able to run `yarn dev` and the server will start. You should be able to see the application schema at http://localhost:3002/graphql.


## Kubernetes
### How to launch a service

Launching `hello-minikube` example
```
kubectl run hello-minikube --image=gcr.io/google_containers/echoserver:1.4 --port 8080
kubectl expose deployment hello-minikube --type=NodePort
```

### How to launch a container
Create the `pod.yml` file that describes the pod:
```
apiVersion: v1
kind: Pod
metadata:
  name: nodetest.example.com
  labels:
    app: helloworld
spec:
  containers:
    - name: nodetest
      image: lnmunhoz/nodeapp-test
      ports:
      - containerPort: 3000
```

Then to deploy to the cluster:
```
kubectl create -f pod-helloworld.yml
```

Port forwarding: 
This will forward `localhost:8081` to the AWS_IP_ADDRESS:PORT
```
kubectl port-forward nodetest.example.com 8081:3000
```





# Mobile Verify v4 API
Tools and specifications that describe the Mobile Verify v4 API. This includes a
mock implementation of the server that makes use of
[Swagger UI](https://swagger.io/tools/swagger-ui/) in order to easily interact
with the server.

## Mock Server
Using the OpenAPI 3.0 Specification we are able to provide predefined responses
to some common scenarios that allow current and prospective users to see how the 
API responds in certain situations.

### Prerequisites
There are two ways to run the mock server locally:
- Docker (preferred)
  - Isolates all dependencies into a container
  - Will need [Docker Engine](https://docs.docker.com/get-docker/) installed on 
    the machine running the container
- Node.js and npm
  - Ability to run Node express apps directly.
  - \>= Version 15.1.0 (https://nodejs.org/en/download/current/)

> At least one of these components should be installed.

### Running The Mock Server
```bash
./_scripts/mock-api_dev.sh
```

When the mock is finished launching you will see a message:
```
...
Running on port 8080
```
Then the server will be available at `http://localhost:8080`.

## Deployed Environments and Base URLs
Below is a table describing the deployed environments and their respective URL 
at which they can be found:
| Environment | Base URLs |
| ----------- | ----------- |
| dev | [mv4-mock-api.devcon.us.mitekcloud.local](https://mv4-mock-api.devcon.us.mitekcloud.local/) |

## API Spec
The MV4 API is defined in `./specs/mv4-api.yaml`. Please see the yaml file itself 
for all available operations. We have also made use of the Swagger UI so that it 
can be viewed by going to `/docs` with your choice of Base URL found above.

## Documentation UI
[Swagger UI](https://swagger.io/tools/swagger-ui/) is built into the mock server 
and allows you to directly call the endpoints. After starting the mock server, 
navigate to http://localhost:8080/docs to start sending requests.

### View Available Specifications
The server also serves the specification files so they can be viewed or copied.
They can be found by adding `/specs` to your base URL of choice.

### Authentication Token
The authentication token can be retrieved by using the `/oauth2/token` endpoint
found in the documentation UI, but it is placed here for posterity:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJzdWIiOiIxMjM0NTY3ODkwIiwiY2xpZW50SWQiOiI4MGVjY2QwNi1mNjkwLTRjYzEtYWZjNy1jYWQ3NmRjYjg1YTMpYXQiOjE2MjYwOTk2MjksImVhdCI6MTYyNjEwNjgyOX0.-DYPvekpIWV6jKqCF00cS8x0v-Yj6-wk6JBy3Quu0Lo
```

## Contributing
This is your reminder to not forget that we us eslint, so lint your code!
```bash
npm run lint
```
...or have [an extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) installed in your editor so that you're linting along the 
way!

## Testing
To run the tests just run the following command:
```bash
cd mock-api
npm test
```

or you can run an individual test with the following:
```bash
npm test -- -t '[NAME OF SINGULAR TEST]'
```

## Technology Index
- [morgan](https://github.com/expressjs/morgan)
- [OpenAPI Backend](https://github.com/anttiviljami/openapi-backend)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express)
- [yaml.js](https://github.com/jeremyfa/yaml.js)
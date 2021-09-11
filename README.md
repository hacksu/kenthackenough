


## Docker

Docker is used to provide various resources for this repository, such as a redis and mongodb database.

### Development Mode

Development mode does pass-through to the nodejs program within this repository through Docker. 

```bash
npm run docker:up
```

With this, you retain full control over the program by running it in its own terminal, yet
remain able to access it from port 80 as if it was running in production. It'll even have access
to all its databases.

```bash
npm run docker:down
```

### Production Mode

When you are no longer updating the backend, Docker can run the backend itself.

```bash
npm run production:up
```

```bash
non run production:down
```


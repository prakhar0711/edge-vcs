# Edge Version Control System

Edge is a lightweight version control system implemented in Node.js. It provides basic functionality similar to Git, allowing you to initialize a repository, add files, commit changes, view commit history, and show commit diffs.

## Features

- Initialize a new repository
- Add files to the staging area
- Commit changes with messages
- View commit history
- Show diff between commits

## Installation

1. Clone this repository:

   ```
   git clone https://github.com/prakhar0711/edge-vcs.git
   ```

2. Navigate to the project directory:

   ```
   cd edge-vcs
   ```

3. Install dependencies:

   ```
   npm install
   ```

4. Make the script executable:

   ```
   chmod +x edge.js
   ```

5. (Optional) Create a symlink to use `edge` command globally:
   ```
   npm link
   ```

## Usage

### Initialize a new repository

```
edge init
```

This command initializes a new Edge repository in the current directory.

### Add a file to the staging area

```
edge add <file>
```

Replace `<file>` with the path to the file you want to add.

### Commit changes

```
edge commit <message>
```

Replace `<message>` with your commit message.

### View commit history

```
edge log
```

This command displays the commit history of the repository.

### Show commit diff

```
edge show <commitHash>
```

Replace `<commitHash>` with the hash of the commit you want to inspect.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

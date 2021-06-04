# Git Object Types

- **The blob** - the _contents_ of the file stored as a blob. Indentical file contents are only stored once and the blob is simply referenced multiple times
- **The tree** - these are analagous to FS directories and are a simple list of trees and blobs, alongside a contents section that lists the mode, type, name and SHA of each entry in the list
- **The commit** - also very simple, it's a reference to a tree and keeps an author, committer, message and any parent commits that _directly_ precede it.
- **The tag** - an object that points to (usually) a particular commit. It contains fields of object (SHA reference), type (e.g. commit), tag (name) and tagger
- **All of these objects are immutable**

# Git Data Model

- Directed acyclic graph
- All commits point to a tree and optionally to previous commits
- In addition to the objects (outlined above), which are immutable, there are references which are simple pointers to a particular commit and can constantly change (similar to a tag, but easily moveable)
- Examples of references are branches and remotes
- A branch is simply a file in `.git/refs/heads/` that contains the SHA of the most recent commit to that branch

<br/>

# Exercise 1 - Feature Location: Worktrees

### 1. _Find the data structure representing a worktree:_

<br/>

- Location: `worktree.h` on Line 9
    
    ```c
    struct worktree {
        char *path;
        char *id;
        char *head_ref;		/* NULL if HEAD is broken or detached */
        char *lock_reason;	/* private - use worktree_lock_reason */
        char *prune_reason; /* private - use worktree_prune_reason */
        struct object_id head_oid;
        int is_detached;
        int is_bare;
        int is_current;
        int lock_reason_valid; /* private */
        int prune_reason_valid; /* private */
    };
    ```

### 2. _Find the function that gets the current worktree:_

<br/>

- A "worktree" enables a user to have multiple checked-out branches in a working state simulaneously and to switch between them without the need for stashing etc.
- Given that the current worktree, appears to be a "tree" of branches, will the function that gets the current worktree return a "ref" rather than an actual worktree struct?
- The "current" status of a worktree struct is denoted by the `is_current` property on the worktree struct
- `head_ref()` and `git_path()` appear to reference the current "thing" being worked on, (inlcuding worktrees), but I'm not sure this counts as getting the current worktree.
- The `get_worktrees` function (in `worktree.h`) returns a list of worktrees with the first being the "primary" and remaining "linked" worktrees in no particlular order
- `get_main_worktree` does _not_ reference the "current" property on the worktree struct, so presumably "main" !== "current"
- On the `repository` struct, found in `repository.h`, a pointer to a worktree is stored:

```c
/*
* Path to the working directory.
* A NULL value indicates that there is no working directory.
*/
char *worktree;
```

- In `environment.c`, there is a method which returns a  pointer to the worktree referenced by the repository. However, it's not clear that this the _current_ worktree

```c
const char *get_git_work_tree(void)
{
    return the_repository->worktree;
}
```

- The above method is _not_ in the `environment.h` header file, so is not directly accessible to other parts of Git, which makes me question whether this is the single function that retrieves the current work tree, but it's my best candidate.

### 3. _When git is given a new repository, what logic does it use to decide if a repository is bare?_

<br/>

- There is a true/false flag for bare in `.git/config[core]` and an `is_bare` flag on the `worktree` struct
- There is an `is_bare_repository_cfg` flag/enum and `is_bare_repository` method defined in `cache.h`
- In `environment.c` there is a method implemented for determing whether a repository is bare by checking that the config flag `is_bare_repository_cfg` is "truthy" and that no worktree has been set:

```c
int is_bare_repository(void)
{
    /* if core.bare is not 'false', let's see if there is a work tree */
    return is_bare_repository_cfg && !get_git_work_tree();
}
```

<br/>

## Exercise 2 - Feature Location - Submodules

<br/>

### 1. _Find the data structure that represents a submodule:_

<br/>

- The `submodule` data structure can be found in `submodule-config.h`, not `submodule.h`

```c
/*
* Submodule entry containing the information about a certain submodule
* in a certain revision. It is returned by the lookup functions.
*/
struct submodule {
    const char *path;
    const char *name;
    const char *url;
    int fetch_recurse;
    const char *ignore;
    const char *branch;
    struct submodule_update_strategy update_strategy;
    /* the object id of the responsible .gitmodules file */
    struct object_id gitmodules_oid;
    int recommend_shallow;
};
```

<br/>

### 2. _Find the functions that create a new submodule from an existing directory. This includes:_

<br/>

_**a)** A function that creates a submodule from a name or path:_

In `submodule.h`:

```c
/**
* Same as submodule_from_path but lookup by name.
*/
const struct submodule *submodule_from_name(struct repository *r,
                        const struct object_id *commit_or_tree,
                        const char *name);

/**
* Given a tree-ish in the superproject and a path, return the submodule that
* is bound at the path in the named tree.
*/
const struct submodule *submodule_from_path(struct repository *r,
                        const struct object_id *commit_or_tree,
                        const char *path);
```

<br/>

_**b)** The function that actually initializes the submodule structure:_

Both `submodule_from_name` and `submodule_from_path` delegate to `config_from`, shown below and found in `submodule-config.c`. This function returns a `submodule`, but it appears to mainly interact with the cache, so while this appears to be the best candidate, I'm not 100% sure that this actually does the _initialisation_ rather than simply retrieving from the cache.

```c
/* This does a lookup of a submodule configuration by name or by path
* (key) with on-demand reading of the appropriate .gitmodules from
* revisions.
*/
static const struct submodule *config_from(struct submodule_cache *cache,
        const struct object_id *treeish_name, const char *key,
        enum lookup_type lookup_type)
{
    struct strbuf rev = STRBUF_INIT;
    unsigned long config_size;
    char *config = NULL;
    struct object_id oid;
    enum object_type type;
    const struct submodule *submodule = NULL;
    struct parse_config_parameter parameter;
```

<br/>

_**c)** One main (and many helper) lower-level functions used for parsing Git config files:_

There are a number of functions that parse various config files, but I believe the best candidate for a general parser of config files can be found in `config.h` Line 159 with the following call-chain:

```c
/**
* Most programs will simply want to look up variables in all config files
* that Git knows about, using the normal precedence rules. To do this,
* call `git_config` with a callback function and void data pointer.
*
* `git_config` will read all config sources in order of increasing
* priority. Thus a callback should typically overwrite previously-seen
* entries with new ones (e.g., if both the user-wide `~/.gitconfig` and
* repo-specific `.git/config` contain `color.ui`, the config machinery
* will first feed the user-wide one to the callback, and then the
* repo-specific one; by overwriting, the higher-priority repo-specific
* value is left at the end).
*/
void git_config(config_fn_t fn, void *);
```

With its implementation in `config.c`, Line 2399

```c
/* Functions used historically to read configuration from 'the_repository' */
void git_config(config_fn_t fn, void *data)
{
    repo_config(the_repository, fn, data);
}    
```

Which in turn calls `repo_config` on Line 2310 of `config.c`

```c
void repo_config(struct repository *repo, config_fn_t fn, void *data)
{
    git_config_check_init(repo);
    configset_iter(repo->config, fn, data);
}
```

Which finally calls `configset_iter` on Line 1970 of `config.c`. This appears to iterate through a list of values from a "configset", using a callback to parse the values: 

```c
static void configset_iter(struct config_set *cs, config_fn_t fn, void *data)
{
    int i, value_index;
    struct string_list *values;
    struct config_set_element *entry;
    struct configset_list *list = &cs->list;

    for (i = 0; i < list->nr; i++) {
        entry = list->items[i].e;
        value_index = list->items[i].value_index;
        values = &entry->value_list;

        current_config_kvi = values->items[value_index].util;

        if (fn(entry->key, values->items[value_index].string, data) < 0)
            git_die_config_linenr(entry->key,
                        current_config_kvi->filename,
                        current_config_kvi->linenr);

        current_config_kvi = NULL;
    }
}
```

<br/>

_**d)** A callback that processes the keys in the submodules config file:_

<br/>

On Line 120 of `config.h` there is a type definition for a callback function for parsing config files:

```C
typedef int (*config_fn_t)(const char *, const char *, void *);
```


In `submodule-config.c` Line 691, the is a function that utilises a callback matching the above type definition for reading config from submodules:    

```c 
void repo_read_gitmodules(struct repository *repo, int skip_if_read)
{
    submodule_cache_check_init(repo);

    if (repo->submodule_cache->gitmodules_read && skip_if_read)
        return;

    if (repo_read_index(repo) < 0)
        return;

    if (!is_gitmodules_unmerged(repo->index))
        config_from_gitmodules(gitmodules_cb, repo, repo); <---- callback used here is here

    repo->submodule_cache->gitmodules_read = 1;
}
```

And the actual callback definition can be found on Line 667 of `submodule-config.c`:

```c
static int gitmodules_cb(const char *var, const char *value, void *data)
{
    struct repository *repo = data;
    struct parse_config_parameter parameter;

    parameter.cache = repo->submodule_cache;
    parameter.treeish_name = NULL;
    parameter.gitmodules_oid = null_oid();
    parameter.overwrite = 1;

    return parse_config(var, value, &parameter);
}
```

<br/>

_**e)** Find two things that change in the parent repository upon adding a submodule_

- The repository's `submodule_cache` - the "repository's submodule config as defined by '.gitmodules'", As shown by the function below from Line 617 of `submodule-config.c`

```C
static void submodule_cache_check_init(struct repository *repo)
{
    if (repo->submodule_cache && repo->submodule_cache->initialized)
        return;

    if (!repo->submodule_cache)
        repo->submodule_cache = submodule_cache_alloc();

    submodule_cache_init(repo->submodule_cache);
}
```

- And the repository's `worktree` path and `gitdir` as shown by the function `repo_submodule_init` on Line 186 of `repository.c`:

```C
int repo_submodule_init(struct repository *subrepo,
            struct repository *superproject,
            const struct submodule *sub)
{
    struct strbuf gitdir = STRBUF_INIT;
    struct strbuf worktree = STRBUF_INIT;
    int ret = 0;

    if (!sub) {
        ret = -1;
        goto out;
    }

    strbuf_repo_worktree_path(&gitdir, superproject, "%s/.git", sub->path);
    strbuf_repo_worktree_path(&worktree, superproject, "%s", sub->path);

    if (repo_init(subrepo, gitdir.buf, worktree.buf)) {
        /*
        * If initialization fails then it may be due to the submodule
        * not being populated in the superproject's worktree.  Instead
        * we can try to initialize the submodule by finding it's gitdir
        * in the superproject's 'modules' directory.  In this case the
        * submodule would not have a worktree.
        */
        strbuf_reset(&gitdir);
        strbuf_repo_git_path(&gitdir, superproject,
                    "modules/%s", sub->name);

        if (repo_init(subrepo, gitdir.buf, NULL)) {
            ret = -1;
            goto out;
        }
    }

    subrepo->submodule_prefix = xstrfmt("%s%s/",
                        superproject->submodule_prefix ?
                        superproject->submodule_prefix :
                        "", sub->path);

out:
    strbuf_release(&gitdir);
    strbuf_release(&worktree);
    return ret;
}
```

<br/>

## Exercise 3 - Feature Location Freestyle (Rebasing)

<br/>

Write down three questions about the internals of git. Set a 15 minute timer and attempt to answer it, or at least isolate the code that handles it. If you fail, set another 15 minute timer and try again. For each question you attempted, explain what you found and how you got there. If you failed to answer, explain explained what you tried. Reflect on why you succeeded or failed.

### 1. Find the code that parses the actions to perford during an interactive rebase

- `rebase.h` defines an enum of provide a limited selection of rebase-types, one of which is `REBASE_INTERACTIVE`:

```C
enum rebase_type {
	REBASE_INVALID = -1,
	REBASE_FALSE = 0,
	REBASE_TRUE,
	REBASE_PRESERVE,
	REBASE_MERGES,
	REBASE_INTERACTIVE
};
```

- `rebase-interactive.h` contains various functions that reference the concept of a "todo list". I'm not sure what this is. The `todo_list` data structure is defined as follows in `sequencer.h` Line 114:

```C
struct todo_list {
	struct strbuf buf;
	struct todo_item *items;
	int nr, alloc, current;
	int done_nr, total_nr;
	struct stat_data stat;
};
```

- The `todo_list` struct references a `todo_item` struct, which is defined as follows in `sequencer.h`:

```C
struct todo_item {
	enum todo_command command;
	struct commit *commit;
	unsigned int flags;
	int arg_len;
	/* The offset of the command and its argument in the strbuf */
	size_t offset_in_buf, arg_offset;
};
```

- In turn, the `todo_item` struct references a `todo_command` enum, which references several familiar terms such as `PICK` and `SQUASH`, which suggests that these "commands" and therefore the `todo_items` may form the list of items to be rebased.

- It appears that the heavy-lifting of performing a rebase is carried-out by code in `sequencer.c`, rather than the `rebase` and `rebase-interactive` files

- `sequencer.c` appears to enable a list of "options" to be built via `read_strategy_opts` and `parse_strategy_opts` which are then used when looping through each "todo-item" to determine the "action" (e.g pick, revert, fix etc) to be taken. See `read_populate_todo` Line 2670 of `sequencer.c`:

```C
static int read_populate_todo(struct repository *r,
			      struct todo_list *todo_list,
			      struct replay_opts *opts)

                  /* Too long to include */
```

- Presumably the relevant options are read from the command-line when doing a rebase, after the user has specified which commits to pick, fix, reword etc. Where is this done? 
- The functions `todo_list_parse_insn_buffer` on Line 2518 and  `parse_insn_line` on Line 2391 of `sequencer.c` appear to be parsing the char content of a file containing the list of "todo-items" and their associated actions specifed by the user during the interactive rebase: 

```C
int todo_list_parse_insn_buffer(struct repository *r, char *buf,
				struct todo_list *todo_list)
```    

```C
static int parse_insn_line(struct repository *r, struct todo_item *item,
			   const char *buf, const char *bol, char *eol)
```

<br/>

**Reflection:** This took me a couple of iterations to find anything concrete as a "rebase" does not exist in data itself - the central concepts turned-out to be the `todo_list` and `todo_item`, which I initially passed over as I didn't recognise the terminology or its significance. In addition, the relevant code did not live with the files named after rebase, but in `sequencer.c`. Once I followed the references to `todo_list`, the implementation of the "interactive" part of an interactive rebase became more clear.

<br/>

### 2. Find the code that updates the parent refs on rebased commits

- My assumption is that, depending on the strategy, a rebase will involve the updating of the ref to the parent of a commit
- The `todo_item` struct in `sequencer.h` contains a pointer to a commit - presumably this is the commit that will be updated as the sequencer process the each `todo_item` in the `todo_list`
- A `replay_opts` struct, also in `sequencer.h`, is passed to the various functions in the sequencer which carry out the changes to each `todo_item`
- There is a `complete_action` function, (`sequencer.c` Line 5583), which look promising due to it's name and the paramters it accepts (i.e. `replay_opts` and `todo_list`)

```C
int complete_action(struct repository *r, struct replay_opts *opts, unsigned flags,
		    const char *shortrevisions, const char *onto_name,
		    struct commit *onto, const struct object_id *orig_head,
		    struct string_list *commands, unsigned autosquash,
		    struct todo_list *todo_list)
```

- After parsing a large number of options, `complete_action` calls `checkout_onto` and `pick_commits`, which appear to do the modification of each commit.

- `checkout_onto` calls `update_ref`, which if we follow the call chain, eventually leads to `refs_update_ref` (`refs.c` Line 1339)

```c
static int checkout_onto(struct repository *r, struct replay_opts *opts,
			 const char *onto_name, const struct object_id *onto,
			 const struct object_id *orig_head)
{
	const char *action = reflog_message(opts, "start", "checkout %s", onto_name);

	if (run_git_checkout(r, opts, oid_to_hex(onto), action)) {
		apply_autostash(rebase_path_autostash());
		sequencer_remove_state(opts);
		return error(_("could not detach HEAD"));
	}

	return update_ref(NULL, "ORIG_HEAD", orig_head, NULL, 0, UPDATE_REFS_MSG_ON_ERR);
}
```

- `pick_commits` (Line 4269 `sequencer.c`) loops through each `todo_item` and checks the desired "command" (e.g. squash, reword etc.) and appears to actually perform the ref change to the commit. 

```C
static int pick_commits(struct repository *r,
			struct todo_list *todo_list,
			struct replay_opts *opts)
```

- As a side-note, the body of `pick_commits` demonstrates that the _order_ of the action options (specified by the enum `todo_command`) is important - there are some LT/GT comparisons made to option values e.g.:

```C
		if (item->command <= TODO_SQUASH) {
			if (is_rebase_i(opts))
				setenv(GIT_REFLOG_ACTION, reflog_message(opts,
					command_to_string(item->command), NULL),
					1);
```


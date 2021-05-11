1. Compare the write_message methods of the console-based and file-based backends. There is hidden coupling between them. What is the hidden coupling? What changes does this hidden coupling inhibit? How would you refactor them to eliminate it.
   
    Hint: If your answer is related to inheritance, then you are likely noticing an instance of visible coupling, and are on the wrong track.

    _I susptect that this is the inheritance-based coupling mentioned above, but I don't have a better answer: It's necessary to set stream to None in the constructor to avoid defaulting output to stdout, since the super-class expects to be streaming/writing to the console. Later, in the open method, it is forced to check that stream is None (which it always it should be) before getting a filepath to write to._

    _My only other guess is that there appear to be some implicit assumptions about character encoding.

2. The send_messages methods of both the SMTP-based and console-based (and file-based, by inheritance) backends have a common notion of failing silently according to an option. 

	**a)** What is the essence of the "fail-silently" pattern? In other words, if I gave code where all identifiers were obfuscated, how would you identify code that implemented the "fail-silently" feature? Give your answer either as a very specific description of data- and control-flow to look for, or as a code skeleton.
	
    _In the presence of an error/exception, choosing not to throw based on a condition forms the basis of failing silently. My generalised pseudo-code skeleton would be:_

    ```
    try {
        // some operation
    } catch (some_error) {
        if (NOT some_condition) { 
            throw some_error 
        }
    }
    ```
	
	**b)** What are the design decisions which are the same between the two backend's implementation of fail-silently, and how might a change to these decisions affect both implementations? Think about other policies for how the application should handle exceptions other than "fail at the top-level immediately for all exceptions" and "silently drop all exceptions."

    - _Both implementations rely on a `fail_silently` boolean option set at the instance level, which implies that either _all_ exceptions will fail silently or _all_ exceptions will be raised, regardless of the type of exception or a what stage of execution it occurs._
    - _It appears that unless set to `fail_silently`, both implementations will exit from the queue of messages if an exception is raised (i.e. remaining messages in the queue will not be sent).  A change in design decision might be to capture the exception and continue processing the queue, before reporting on failures at the end. This would affect both implementations._
    - _Since the `fail_silently` option is set on the base class this introduces coupling which makes this behavior difficult to change independently in each implementation._

	**c)** Sketch how to refactor the code to eliminate this hidden coupling. A successful solution should give code for "failing silently" that can be used in contexts unrelated to E-mail. (Hint: Use Python's with statement)
	
    ```
    class MessageSender(object):
        def __init__(self, channel, exceptionHandler):
            self.channel = channel
            self.exceptionHandler = exceptionHandler

        def __enter__(self):
            self.channel.open()
            return self.channel
        
        def __exit__(self, type, value, traceback):
            self.channel.close()
            return self.exceptionHandler(value)
    ```

    ```
    # Example usage in smtp.py

    ...

    if not email_messages: 
        return;
        msg_count = 0
        with self._lock
        with MessageSender(self, self._handle_exceptions) as connection
            for message in email_messages
                connection.sendmail(..., message)
    ...


    def _handle_exceptions(exception):
        return isInstance(exception, (SMTPException, OtherException))
    ```

3. The __init__ method of the file-based backend is complicated because of the impedance mismatch between the file path argument it accepts and the actual requirements on files.
	
    **a)** What are the concrete restrictions it is placing on file paths? What are the underlying design decisions behind these restrictions?

    Concrete restrictions:
    - filepath must be passed in or is obtained from a settings file
    - filepath must be a string
    - filepath must specify a directory (if it exists)
    - must be able to create the filepath, if it does not exist
    - filepath must be writeable

    Underlying design decisions?:
    - Each email message is written as a file to a specified directory on the local filesystem (not sure I'm on the right track here)

	**b)** What changes to the system's overall design or assumptions may change this code?

    - Runs in a context where it doesn't have access to the filesystem, or where the filesystem is not writeable??
    - May want to write to a file over a network location??

	**c)** Sketch how to refactor this method to embed the design decisions identified in 3.1 directly into the code.

    ```
    class EmailBackend(ConsoleEmailBackend):
        def __init__(self, *args, writeable_filesystem_dir=None, **kwargs):
            self._fname = self._get_filename
            if writeable_filesystem_dir is not None
                self.file_loc = writable_filesystem_dir
            else:            
                self.file_loc = getattr(settings, 'EMAIL_FILE_PATH', None)

            with open(os.path.join(self.file_loc, self.fname) as file
                self.stream = file
    ```
    - I'm not really familiar with Python, so not sure the above would work, but perhaps it would be more "idiomatic" Python to simply try the write operation immediately, although I don't believe this necessarily embeds the design more clearly. Renaming the argument might make the expection of what should be passed-in more clear, but this doesn't seem like it would be enough
    - I might also prefer to remove the default option to force the consumer to ensure they are explictly providing a writeable location (rather than invisibly retriving a location from settings), but this would break existing client-code.
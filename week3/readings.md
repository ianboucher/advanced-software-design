## Applying the Linus Torvalds "Good Taste" Requirement

<br/>

https://medium.com/@bartobri/applying-the-linus-tarvolds-good-taste-coding-requirement-99749f37684a#.hth8kpiiv


_The author claims that the core of the taste requirement is "eliminating edge cases." However, this does not explain why it's natural that good-taste code might be more efficient, as in the Grid Edges example. What is another way of describing the "good taste" requirement which also explains why good code is often more efficient?_

- As described, I believe good taste code is likely to be more efficient since it forces the programmer to select the most appropriate data structure and ensure only valid states can be represented by relying-upon the properties of that structure, rather than handling various cases in the code. Proper use of data structures is often the best path to efficient code. 

<br>

## Bugs and Battleships

<br>

http://blog.ezyang.com/2011/12/bugs-and-battleships/

_The author talks about splitting software into different cases, each of which corresponds to one test. Give some examples of these cases. What causes a case to split into two?_

- Each distinct representable state that corresponds to a valid/invalid state of the application could be considered to be a case that may be tested. A case may be split in two by having a representable state (input) that maps to both valid and invalid output states.

- An example of the above could be illustrated by the linked-list example given by Torvalds above: by differentiating the head of the list from any other node, this presents 2 possible states/cases that must be handled differently and therefore should be tested.

<br>

## The Most Dangerous Code in the World

<br>

https://www.cs.utexas.edu/~shmat/shmat_ccs12.pdf

Summary: This paper describes how many major commercial and open-source libraries misconfigure SSL such that it is entirely broken, leaving consumers of those libraries unaware that they are vulnerable to man-in-the-middle attacks. The source of these problems appears to be the the non-obvious configuration options for the underlying libs (e.g. CURL). For example names suggest that they accept a boolean, but actually accept a number, with both 0 and 1 being insecure settings, leading to (for example) booleans being coerced into insecure values.

_Have a look at the fix to CURLOPT_SSL_VERIFYHOST, https://curl.haxx.se/libcurl/c/CURLOPT_SSL_VERIFYHOST.html, particularly how they fixed it prior to version 7.66. Notice the added complexity needed to prevent this bug while maintaining backwards-compatibility. What would the libcurl developers need to do to be able to simplify it again? What are the downsides of what they actually did?_

**What they did:**

- Before v7.28 value of 1 treated as a "debug" option - i.e. insecure. Not supported due to programmer mistakes.
- Before v7.66  made setting the option to 1 return an error, but left the flag untouched
- From v7.66 values of 1 & 2 are treated the same - i.e. secure

**What would the libcurl developers need to do to be able to simplify it again?**

- With the requirement to maintain backwards compatibility, I can't think of an improvement to the implementation described above from 7.66 onwards. They had limited room for manoeuvre.

- Without the need for backwards compatibility

    a) The options for `CURLOPT_SSL_VERIFYHOST` could be reduced to just two - secure & insecure (0 & 1). This would have the (questionable)advantage of accidental boolean coercion resulting in correct behaviour.

    b) The type of the option could have been changed to specific strings/enums so that users are clear as to what option they are specifying and what the implications are

**What are the downsides of what they actually did?**

In each case, the implications of the options set in the calling code were not apparent to the user without reference to the documentation. 

After v7.28 the returned error could easily have been silently swallowed by the consumer. 

After v7.66, where users had used option 1 purposefully, the behaviour of the system would have changed without prior knowledge and where used in new code, usage of the options would still not have been explicit in the code without reference to the documentation.

# This is AWESON!!!

JSON is so... XML.

The instant that someone decides to add a schema language, it's already too late.

AWESON (arrays with extra stuff object notation) is superior in every way.

```
This is an AWESON document!
```

See, easy as pie.

# AWESON Types

AWESON has two basic types: strings and arrays.

## AWESON Strings

A string can include any unicode character.  AWESON is always UTF-8 encoded.

The easy way to create a strings is to just include the string.  Any whitespace at the start and end (but not the middle) is conveniently ignored for you.

```
This is an example string, and a valid document.
```

The only restriction is that you don't use one of our reserved characters in an unquoted string.  These are `'`, `<`, >`, and `"`.  (Well, a single quote is ok, if it's not the first character.)

You can quote strings using a single quote `'` character, one at the start, another at the end.  Within a string, two single quotes in a row are replaced by a single quote.  Other AWESON characters are just fine.

```
'Don''t fear the quoted string.  Even if it has AWESON characters <>"'''
```

Strings that appear next to each other separated by whitespace are concatenated.

```
'Sometimes,'
' splitting onto two lines is nice.'
```

This includes unquoted strings.

```
'which only makes sense'
for the very last string of the set
since unquoted strings consume everything
```

## Arrays

Arrays are the only complex type in AWESON.  Elements of arrays are both ordered (I'd like to see you invent a serialization format that didn't order elements of anything) and named.  Indexes start

Arrays start and end with two (two == more AWESON) angle brackets.

Names for elements are enclosed in one set of angle brackets.  Names are strings.

A simple array with three elements called `a`, `b`, and `c` looks like:

```
<<
  <a>Value A
  <b>Value B
  <c>Value C
>>
```

Naming elements is optional, just drop the opening angle bracket and you don't have to provide a name.

```
<<
> First value
> 2nd > The 3rd and final value
>>
```

## Whitespace

AWESON ignores space, tab and new line characters if they appear at the start or end of a bare string and everywhere it makes sense to do so.

## Comments

JSON doesn't.  Just put stuff into your whitespace.  Use double quotes (`"`) to mark the start and end of a comment.

```
"this is a comment" this is a value "and this is another comment"
```

# FAQ

Q: Why invent another serialization format?
A: Why not?

Q: What about numbers?
A: Learn to love `parseInt()` (or your number parser of choice).  One reason we didn't specify a numeric format is that we don't need to worry about conventions like what radix your number system uses.

Q: How do I represent a null value?
A: Don't.

Q: Why is this better than JSON again?
A: Fewer types.  The syntax is easier to type.

Q: Your braces don't match!
A: Oh, you mean the whole optional name thing?  Get over it.

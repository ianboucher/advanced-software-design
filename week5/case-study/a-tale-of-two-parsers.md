# Data Modelling

1. _Look at JavaParser's [PrimitiveType.Primitive](https://static.javadoc.io/com.github.javaparser/javaparser-core/3.5.19/com/github/javaparser/ast/type/PrimitiveType.Primitive.html) enum. Express it as a sum type:_

```java
// do each of these need a String type against them?
PrimitiveType.Primitive 
    = BOOLEAN 
    | BYTE 
    | CHAR
    | DOUBLE
    | FLOAT
    | INT
    | LONG
    | SHORT 
```

2. _Consider Javaparser's [PrimitiveType](https://static.javadoc.io/com.github.javaparser/javaparser-core/3.5.19/com/github/javaparser/ast/type/PrimitiveType.html) class. Express the valid values as an algebraic data type. It may help you to look at the getters and constructors._

```java
// constructor
PrimitiveType(PrimitiveType.Primitive type, NodeList<AnnotationExpr> annotations) 

// getters
PrimitiveType.Primitive getType(); 
PrimitiveTypeMetaModel  getMetaModel(); // I believe this is lexical data and can be omitted from the type definition

// 'annotations' exists as a field on the (abstract) superclass
// not sure how this should be represented alebraically unless the superclass should be included in the definition
PrimitiveType 
    = NodeList<AnnotationExpr> [ byte | short | char | int | long | float | double | boolean | void ]

// assuming relevant superclasses should be inlcuded in the definition
Type NodeList<AnnotationExpr>
    = PrimitiveType 
        = byte | short | char | int | long | float | double | boolean | void
```

3. _Repeat this exercise for JDT's [PrimitiveType](https://help.eclipse.org/oxygen/ntopic/org.eclipse.jdt.doc.isv/reference/api/org/eclipse/jdt/core/dom/PrimitiveType.html) class. How does it differ from Javaparser?_

```java
PrimitiveType  
    = List<Annotation> [ byte | short | char | int | long | float | double | boolean | void ]

// assuming superclasses should be inlcuded in the definition
Type
    = AnnotatableType   
        = List<Annotation> PrimitiveType     
            = byte | short | char | int | long | float | double | boolean | void
```

The JDT `PrimitiveType` definition differs from the Javaparser equivalent in that there is an additional _abstract_ class `AnnotatableType` which is used to contain the `annotations` field for all the 'annotatable' classes that inherit from it. In contrast the Javaparser version includes the `annotations` field in the base `Type` class, although several of its subclasses do not support annotations. Presumably the Javaparser `Type` class `annotations` field defaults to an empty `NodeList` in this scenario.

4. _Javaparser's `Type` class has a `getAnnotation()` method, and so presumably also a corresponding annotations field. Consider pulling down this annotations field into each subtype. Show what this looks like in algebraic data type notation. What algebraic law are you using?_

```java
Type 
    = NodeList<AnnotationExpr> [
          IntersectionType
        | PrimitiveType     byte | short | char | int | long | float | double | boolean | void
        | ReferenceType
        | UnionType
        | UnknownType 
        | VarType
        | VoidType
        | WildcardType     
    ]


// Pulling annotations down into subtypes uses the law of distribution:
// NB: UnknownType & VarType do not support annotations
Type 
    = IntersectionType  NodeList<AnnotationExpr>
    | PrimitiveType     NodeList<AnnotationExpr> [ byte | short | char | int | long | float | double | boolean | void ]
    | ReferenceType     NodeList<AnnotationExpr>
    | UnionType         NodeList<AnnotationExpr>
    | UnknownType 
    | VarType
    | VoidType          NodeList<AnnotationExpr>
    | WildcardType      NodeList<AnnotationExpr>    
```

5. _Look at [JDT's Type class](https://help.eclipse.org/oxygen/ntopic/org.eclipse.jdt.doc.isv/reference/api/org/eclipse/jdt/core/dom/Type.html). Ignore all subclasses except ArrayType, UnionType, and AnnotatableType. Write the remainder of the Type class as an algebraic data type in terms of these subclasses. Repeat for AnnotatableType, considering only the subclasses PrimitiveType and SimpleType._

```java
Type 
    = ArrayType    Type List<Dimension> [ List<Annotation> ] // each "dimension" has list of annotations - how to represent?
    | UnionType    List<Type>
    | AnnotatableType ...

// Expanding algebraic definition of AnnotatableType: 
AnnotatableType   List<Annotation> [
      SimpleType        Name
    | PrimitiveType     byte | short | char | int | long | float | double | boolean | void
]
```

6. _Repeat for the Javaparser Type class, ignoring all subclasses except PrimitiveType, ReferenceType, UnionType, UnknownType, and VoidType. Repeat for the Javaparser ReferenceType class. (Ignore the ReferenceTypeMetaModel, which comes from later processing, and is not really part of the AST.)_

```java
Type 
    = NodeList<AnnotationExpr> [
        | PrimitiveType     byte | short | char | int | long | float | double | boolean | void
        | UnionType
        | UnknownType 
        | VoidType   
        | ReferenceType ...
    ]

// Expanding algebraic definition of ReferenceType: 
// Not sure how to represent when a property (NodeList<AnnotationExpr>) 
// is on the superclass rather than on the subclass itself
ReferenceType 
    = ArrayType             Type        Origin 
    | ClassOrInterfaceType  SimpleName  NodeList<Type>
    | TypeParameter         String      NodeList<ClassOrInterfaceType>
        
```

7. _Show how to algebraically modify the two algebraic data types for the respective Type classes to be as similar as possible. Show your steps and name the algebraic laws used at each._

```java
// Javaparser
JPType 
    = NodeList<AnnotationExpr> [
        | PrimitiveType     byte | short | char | int | long | float | double | boolean | void
        | UnionType
        | UnknownType // doesn't support annotations
        | VoidType   
        | ReferenceType 
            = ArrayType             Type        Origin 
            | ClassOrInterfaceType  SimpleName  NodeList<Type>
            | TypeParameter         String      NodeList<ClassOrInterfaceType>
    ]

// JDT
JDTType 
    = ArrayType         Type List<Dimension> [ List<Annotation> ] // each "dimension" has list of annotations - how to represent?
    | UnionType         List<Type>
    | AnnotatableType   List<Annotation> [
        | SimpleType        Name
        | PrimitiveType     byte | short | char | int | long | float | double | boolean | void
    ]
    

// A list of one can be algebraically represented as 1 + thetype
// Can ReferenceType and/or AnnotatableType be flattened (subclasses pulled-up)?
// Can annotatable type be refactored/split-up or some of the subtypes on Javaparser Type be made more like AnnotatableType?
// Could should annotations be pulled-up or down?

// remove intermediate abstract class ReferenceType - think this is valid from a data POV if we ignore the methods defs on abstract class that would have to be relocated
// not sure what the algebraic law would be??????????????????? 
JPType 
    = NodeList<AnnotationExpr> [
        | PrimitiveType     byte | short | char | int | long | float | double | boolean | void
        | UnionType
        | UnknownType // doesn't support annotations
        | VoidType   
        | ArrayType             Type        Origin 
        | ClassOrInterfaceType  SimpleName  NodeList<Type>
        | TypeParameter         String      NodeList<ClassOrInterfaceType>

// Pull annotations down on javaparser - law of distribution
JPType 
    = PrimitiveType         NodeList<AnnotationExpr> [ byte | short | char | int | long | float | double | boolean | void ]
    | ReferenceType         NodeList<AnnotationExpr>
    | UnionType             NodeList<AnnotationExpr>
    | UnknownType
    | VoidType              NodeList<AnnotationExpr>
    | ArrayType             NodeList<AnnotationExpr> Type        Origin 
    | ClassOrInterfaceType  NodeList<AnnotationExpr> SimpleName  NodeList<Type>
    | TypeParameter         NodeList<AnnotationExpr> String      NodeList<ClassOrInterfaceType> 

// Pull down annotation on AnnotationType (& remove) - also law of distribution
JDTType 
    = ArrayType             Type List<Dimension> [ List<Annotation> ] // each "dimension" has list of annotations - how to represent?
    | UnionType             List<Type>
    | SimpleType            List<Annotation> Name
    | PrimitiveType         List<Annotation> [ byte | short | char | int | long | float | double | boolean | void ]
    
```
# TODO: COME BACK AND FINSH OFF THE ABOVE REFACTORING....

# Code Follows Data

This part concerns [Genprog 4 Java](https://github.com/squaresLab/genprog4java), a port of the [Genprog system](https://squareslab.github.io/genprog-code/) to Java based on the Eclipse JDT. Genprog is an [automated program repair](http://program-repair.org/) tool that takes in programs with failing test cases, and searches over hundreds of ways to patch the program until it finds one that makes all tests pass.

Consider [OffByOneOperation.java](https://github.com/squaresLab/genprog4java/blob/c1ab6e01a9dc5d5db682fa0a85c5656bc3215b7b/src/clegoues/genprog4java/mut/edits/java/OffByOneOperation.java), which patches an expression by adding or subtracting one.

1. _Look at the mutateIndex method, and consider the cases for PrefixExpression and PostfixExpression. What prevents the Genprog authors from merging both into one case?_

I beleive it is due to `Operator` being a field on _each_ of `PrefixExpression` and `PostfixExpression`, requiring the correct type of `Operator` to be set in order to maintain compatibiltiy with the pre-or-postfix `Expression` type:

```java
    if (arrayindex.toString().contains("++")) {
        pexp.setOperator(...); // set pre-or-postfix specific increment operator
    } else if (arrayindex.toString().contains("--")) {
        pexp.setOperator(...); // set pre-or-postfix specific decrement operator
    }
```

2. _Sketch what these cases would look like had Genprog 4 Java been built on Javaparser instead of the Eclipse JDT._

**This appears to be the difference between a PRODUCT type (JDT) and a SUM type (Javaparser)
```java
    } else if (arrayindex instanceof UnaryExpr && (arrayindex.toString().contains("++") || arrayindex.toString().contains("--"))) {
        UnaryExpr pexp = arrayindex.getAST().newUnaryExpr();
        String indexname = ((UnaryExpr) arrayindex).getOperand().toString();
        pexp.setOperand(arrayindex.getAST().newSimpleName(indexname));

        // Although the Javaparser implementation allows the merging of the 'top-level' casing
        // it is still necessary to case-over the potential options, which still exist 
        // and therefore must be dealt with in a different location in the code
        // NOT SURE IF THERE IS A MORE ELEGANT WAY TO DO THIS
        if (arrayindex.toString().contains("++")) {
            if (arrayIndex.isPostfix()) {
                pexp.setOperator(UnaryExpr.Operator.POSTFIX_INCREMENT);
            } else
                pexp.setOperator(UnaryExpr.Operator.PREFIX_INCREMENT) 
            }
        } else if (arrayindex.toString().contains("--")) {
            if (arrayIndex.isPostfix()) {
                pexp.setOperator(UnaryExpr.Operator.POSTFIX_DECREMENT);
            } else
                pexp.setOperator(UnaryExpr.Operator.PREFIX_DECREMENT) 
            }
        }

        // etc ...

        return mutatedindex;

    } 
```

3. _What changes would need to be made to the Eclipse JDT so that the authors of Genprog can merge these cases? What algebraic laws make this possible?_

**Check Reasoning: it may not be possible to have the operator in a superclass - there may be some differences**
If the `Operator` field was contained within a common superclass/direct ancestor it should be possible to combine the cases for `PrefixExpression` and `PostfixExpression` into a single case. 

```java

Expression
    = PrefixExpression  Operator
    | PostfixExpression Operator

Expression
    = UnaryExpression Operator
        = PrefixExpression
        | PostfixExpression

// or is it?
Expression
    = UnaryExpression Operator [ PrefixDecrement | PostfixDecrement | PrefixIncrement | PostfixIncrement ]

```

This above algebraic refactoring utilises the Law of Distribution

4. _What would the authors of Genprog have to do in order to merge those cases without changing the Eclipse JDT?_

```java
    } else if (
        arrayindex instanceof PrefixExpression || arrayIndex instanceof PostfixExpression && 
        (arrayindex.toString().contains("++") || arrayindex.toString().contains("--"))
    ) {

        // would this block and follwing if-statement have to be duplicated??
        // is that really merging the case?? It's just shuffling if statement around
        // There doesn't seem to be any point to this since the casing is just done at a lower level
        // is there another solution that I'm missing???
        if (arrayIndex instanceof PrefixExpression) {
            PrefixExpression pexp = arrayindex.getAST().newPrefixExpression();
            String indexname = ((PrefixExpression) arrayindex).getOperand().toString();
            pexp.setOperand(arrayindex.getAST().newSimpleName(indexname));

            if (arrayindex.toString().contains("++")) {
                pexp.setOperator(org.eclipse.jdt.core.dom.PrefixExpression.Operator.INCREMENT);
            } else if (arrayindex.toString().contains("--")) {
                pexp.setOperator(org.eclipse.jdt.core.dom.PrefixExpression.Operator.DECREMENT);
            }
        } else if (arrayIndex instanceof PostixExpression) {
            PostfixExpression pexp = arrayindex.getAST().newPostfixExpression();
            String indexname = ((PostfixExpression) arrayindex).getOperand().toString();
            pexp.setOperand(arrayindex.getAST().newSimpleName(indexname));

            if (arrayindex.toString().contains("++")) {
                pexp.setOperator(org.eclipse.jdt.core.dom.PostfixExpression.Operator.INCREMENT);
            } else if (arrayindex.toString().contains("--")) {
                pexp.setOperator(org.eclipse.jdt.core.dom.PostfixExpression.Operator.DECREMENT);
            }
        }

        // etc...

        return mutatedindex;
    }
```
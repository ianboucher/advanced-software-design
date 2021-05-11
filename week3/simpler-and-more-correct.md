## Exercise 1


# TODO: TIDY UP CODE SAMPLES (PARTICULALY THOSE THAT DON'T CARRY PREVEIOUS CHANGES). ALSO RECONSIDER Q1

A store has a number of `Discounts`. Each discount can examine a customer and an item, adn checks whether the discount applies. Discounts can be _either_ for a certain type of customer (e.g. student & employee discounts), for a certain item, or for everything on certain days.

```java
public class Discount {
    private String customerTypeDiscount;
    private String itemNameDiscount;
    private String dayOfWeekDiscount;

    private final double discountPercent;

    public boolean doesDiscountApply(Customer c, Item item) {
        if (customerTypeDiscount != null) {
            if (customerTypeDiscount.equals("student")) return c.isStudent();
            else if (customerTypeDiscount.equals("employee")) return c.isEmployee();
        }

        if (itemNameDiscount != null) {
            return item.getName().equals(itemNameDiscount);
        }

        if (dayOfWeekDiscount != null) {
            return DateUtils.getDayOfWeek().equals(dayOfWeekDiscount);
        }

        return false
    }

    public double applyDiscount(double price) {
        return price * (1 - discountPercent);
    }
}
```

1. The comparison to string constants is worrisome — a typo in this or other codecould be hard to detect, and what if the “student discount” is renamed an “academic discount?” Refactor the code so that typos are a non-issue:

# (Not sure if the above is a question in its own right - for now assuming it's a summary of the exercise and the following are the specific questions to be addressed)

**NB:** Working under the assumption that I can only make changes to the `Discount` class and its API, i.e. I am not able to make changes to the `Customer` or `Item` classes.  

2. `customerTypeDiscount` and `dayOfWeekDiscount` can contain arbitrary strings, even though they can only take a restricted set of values. What happens if the calling code passes in “Week-end” as a day-of-week discount, or if the programmer adds a “veteran discount” but forgets toupdate this code? Refactor the day-of-week and customer-type discounts so that they can only contain valid days of week or customer types.

Using the existing enum provided by `DateUtils` and a new enum for `CustomerType`, the range of permissible values for the `customerTypeDiscount` and `dayOfWeekDiscount` can be restricted to known values only

```java

public enum CustomerType { 
    STUDENT, 
    EMPLOYEE 
}

public class Discount {
    private CustomerType customerTypeDiscount;
    private DateUtils.DayOfWeek dayOfWeekDiscount;
    private String itemNameDiscount;

    private final double discountPercent;

    public boolean doesDiscountApply(Customer c, Item item) {
        if (customerTypeDiscount != null) {
            if (customerTypeDiscount.equals(CustomerTypeDiscounts.STUDENT)) return c.isStudent();
            else if (customerTypeDiscount.equals(CustomerTypeDiscounts.EMPLOYEE)) return c.isEmployee();
        }

        if (itemNameDiscount != null) {
            return item.getName().equals(itemNameDiscount);
        }

        if (dayOfWeekDiscount != null) {
            return DateUtils.getDayOfWeek().equals(dayOfWeekDiscount);
        }

        return false
    }

    public double applyDiscount(double price) {
        return price * (1 - discountPercent);
    }
}
```

**NB:** If it were permissable to make changes to the `Customer` class, an imporovement to the above would be to add a `getType` method to the `Customer` class itself and transfer ownership of the `CustomerType` enum:

```java
public class Discount {
    public Customer.CustomerType customerTypeDiscount;
    private DateUtils.DayOfWeek dayOfWeekDiscount;
    private String itemNameDiscount;

    private final double discountPercent;

    public boolean doesDiscountApply(Customer c, Item item) {
        if (customerTypeDiscount != null) {
            return customerTypeDiscount.equals(c.getType())
        }

        ...
    }

    ...
```

3. This API allows you to apply a discount to an item that shouldn't get it. How would you modify the API to prevent that?

The following solution would change the `Discount` class to be initialised with an instance of `Item` to be discounted, rather than accept a string for its name. Since there's nothing intrinsic to an `Item` that knows whether it should or shouldn't receive a discount, this would still not prevent new `Discounts` from being created with any existing `Item`.

```java
public class Discount {
    private final CustomerType customerTypeDiscount;
    private final DateUtils.DayOfWeek dayOfWeekDiscount;
    private final Item discountItem;

    private final double discountPercent;

    public boolean doesDiscountApply(Customer c, Item item) {
        if (customerTypeDiscount != null) {
            return customerTypeDiscount.equals(c.getType())
        }

        if (discountItem != null) {
            return item.getName().equals(discountItem.getName());
        }

        ...
}
```

**NB:** If it were permissible to modify the `Item` class, a minor extension to the above solution might be to include a "discount code" within the `Item` class itself, which could be matched upon:

```java
public class Item {
    private final String discountCode
    ...
    public String getDiscountCode();
    ...
}

public class Discount {
    ...
    private final Item discountItem;

    public boolean doesDiscountApply(Customer c, Item item) {
        ...
        if (discountItem != null) {
            return item.getDiscountCode().equals(dicountItem.getDiscountCode());
        }
    }
}
```

4. It's intended that a discount can only be one of the three types. How would you redesign this code so that `doesDiscountApply` contains no conditionals?

My instict here split the `Discount` class into three subtypes and to use the factory-pattern to instantiate `Discounts` of the desired type according to a `DiscountType` enum. Whilst this _should_ make the application of discounts more robust, the factory pattern only extracts the the branching logic to a higher abstraction (to the factory itself), so I'm not sure it makes the code simpler.

```java

public abstract class Discount {
    protected final double discountPercent;
    public abstract boolean doesDiscountApply(Customer c, Item item);
    
    public double applyDiscount(double price) {
        return price * (1 - discountPercent);
    }
}

public class CustomerDiscount extends Discount {
    ...
    public boolean doesDiscountApply(Customer c, Item item) {
        return customerTypeDiscount.equals(c.getType())
    }
}

// Repeat above for ItemDiscount and DailyDiscount subtypes

public class DiscountFactory {
    public final enum DiscountType { CUSTOMER, ITEM, DAY };

    public Discount getDiscount(DiscountType type) {
        switch(type) {
            case DiscountType.CUSTOMER
                return new CustomerDiscount();
            case DiscountType.ITEM
                return new ItemDiscount();
            case DiscountType.DAY
                return new DailyDiscount();
        }

        return null;
    }
}
```

5. **Bonus:** With the current implementation, a day-of-week discount can’t be tested without waiting until that day.  How would you modify this program to make day-of-week discounts unit-testable?

# TODO: THIS^^


## Exercise 2

In May 2010, Facebook was awash in privacy bugs. If you went to the “Report this profile” window, you could view someone’s hidden photos. The “Preview My Profile” button let you view another friend’s chats. The source of the problem was the reliance on code like this:

```python
    def listPhotos(user, viewingUser):
        for photo is user.getPhotos(db):
            if photo.canView(viewingUser):
                displayPhoto(photo)
```

The Facebook codebase of 2010 is roughly organized into layers. The website layer displays user information in webpages, and provides end-user functionality like the Like button. The middle layer organizes data and provides  operations on it, like finding a user’s top posts. The data layer organizes requests to the database. In the design above, all privacy checks happen in the web layer. How would you redesign the code so that all privacy checks happen at the data layer?

- The obvious solution is to perform the `photo.canView` operation at the data layer, when calling `user.getPhotos(viewingUser)`, such that it is entirely tranparent to the caller.

Using something similar to a DAO or Repository pattern:

```python
# Repository
class UserPhotosRepository(BaseRepository):
    __init__(self):
        self.db = Db()

    def getAll(viewer, owner):
        accessRights = viewer.getAccessRights(owner) or None # e.g PUBLIC_ONLY, FRIENDS_ONLY, ALL etc.
        self.db.get("user_photos", owner, accessRights)

# Manager
```
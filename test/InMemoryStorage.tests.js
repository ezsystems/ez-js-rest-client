/* global define, describe, it, expect, beforeEach */
define(["storages/InMemoryStorage"], function (InMemoryStorage) {
    describe("InMemoryStorage", function () {
        describe("Compatibility", function () {
            it("should always be compatible", function () {
                expect(InMemoryStorage.isCompatible()).toBeTruthy();
            });
        });

        describe("Storage API", function () {
            var storage,
                storageData;

            beforeEach(function () {
                storage = new InMemoryStorage();

                // This is kind of a hack, as we are accessing a private member variable,
                // but it makes testing the basic functionality a lot easier.
                storageData = storage._storage;

            });

            it("should store data under the given key", function () {
                storage.setItem("someKey", "someValue");

                // Double quoting is expected as everything is stored and encoded as json
                expect(storageData.someKey).toBe('"someValue"');
            });

            it("should allow retrieval of data under a given key", function () {
                storageData.someKey = '"someValue"';

                expect(storage.getItem("someKey")).toBe("someValue");
            });

            it("should allow removal of data under a given key", function () {
                storageData.someKey = '"someValue"';

                storage.removeItem("someKey");

                expect(storageData).toEqual({});
            });

            it("should overwrite data if key is already in use", function () {
                storageData.someKey = '"someValue"';

                storage.setItem("someKey", "someOtherValue");

                // Double quoting is expected as everything is stored and encoded as json
                expect(storageData.someKey).toBe('"someOtherValue"');
            });

            it("should return null if requested key does not exist", function () {
                expect(storage.getItem("nonExistantKey")).toBeNull();
            });

            it("should do nothing if non existant key is removed", function () {
                storage.removeItem("nonExistantKey");
                // No exception, nothing ;)
            });
        });

        describe("Arbitrary Data Storage", function () {
            var storage;

            function storeAndRetrieve(value) {
                var result;
                storage.setItem("myGreatKey", value);
                result = storage.getItem("myGreatKey");

                expect(result).toEqual(value);
                expect(typeof result).toEqual(typeof value);
            }

            beforeEach(function () {
                storage = new InMemoryStorage();
            });

            it("should store and retrieve strings", function () {
                storeAndRetrieve("some String");
            });

            it("should store and retrieve integers", function () {
                storeAndRetrieve(23);
            });

            it("should store and retrieve floats", function () {
                storeAndRetrieve(42.3);
            });

            it("should store and retrieve booleans", function () {
                storeAndRetrieve(true);
            });

            it("should store and retrieve arrays", function () {
                storeAndRetrieve([1,"two", "three", 4]);
            });

            it("should store and retrieve objects", function () {
                storeAndRetrieve({
                    some: {
                        nicely: "nested",
                        obj: ["ect", "structure"],
                        or: "what?",
                        1: 2
                    }
                });
            });
        });
    });
});
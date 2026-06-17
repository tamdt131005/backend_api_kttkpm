package com.shop;

import com.intuit.karate.junit5.Karate;

public class AppTest {

    @Karate.Test
    Karate testLogin() {
        return Karate.run("classpath:login.feature");
    }

    @Karate.Test
    Karate testAddress() {
        return Karate.run("classpath:adress.feature");
    }
}
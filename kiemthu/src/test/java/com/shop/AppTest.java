package com.shop;

import com.intuit.karate.junit5.Karate;

public class AppTest {

    @Karate.Test
    Karate testAll() {
        return Karate.run("classpath:login.feature");
    }
}
package com.shop;

import com.intuit.karate.junit5.Karate;

public class AppTest {

    // @Karate.Test
    // Karate testLogin() {
    //     return Karate.run("classpath:login.feature");
    // }

    // @Karate.Test
    // Karate testAddress() {
    //     return Karate.run("classpath:adress.feature");
    // }

    // @Karate.Test
    // Karate testSignup() {
    //     return Karate.run("classpath:signup.feature");
    // }

    // @Karate.Test
    // Karate testUpdateProfile() {
    //     return Karate.run("classpath:update_profile_api_test.feature");
    // }

    // @Karate.Test
    // Karate testCart() {
    //     return Karate.run("classpath:cart.feature");
    // }
    @Karate.Test
    Karate testNhaphang() {
        return Karate.run("classpath:nhaphang.feature");
    }
}
package com.example.appmobile;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

/**
 * Classe utilitaire pour configurer et fournir une instance unique de Retrofit.
 */
public class ApiClient {
    private static final String BASE_URL = "http://10.0.2.2/api/"; //URL de base de l'API
    private static Retrofit retrofit = null;

    public static ApiService getApiService() {
        if (retrofit == null) {
            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit.create(ApiService.class);
    }
}


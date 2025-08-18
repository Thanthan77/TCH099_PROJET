package com.example.appmobile;

import java.util.List;
import java.util.Map;

import com.example.appmobile.PagesRDV.FiltreDateRequest;
import com.example.appmobile.PagesRDV.FiltreHeureRequest;
import com.example.appmobile.PagesRDV.FiltrePersonnelRequest;
import com.example.appmobile.PagesRDV.ServiceRequest;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;

public interface ApiService {


    @GET("services")
    Call<List<ServiceRequest>> getServices();
    // GET pour avoir toutes les informations d'un patient
    @GET("patient/{courriel}")
    Call<Patient> getPatient(@Path("courriel") String courriel);

    // GET pour avoir les rendezvous d'un patient
    @GET("rendezvous/patient/{courriel}")
    Call<RdvResponse> getRDV(@Path("courriel") String courriel);

    // POST pour prendre un rendezvous en tant que pâtient
    @POST("rendezvous/patient")
    Call<Void> postRdv(@Body com.example.appmobile.RdvCreationRequest rdv);
    // POST pour le login de patient (génération du token JWT)
    @POST("login_patient")
    Call<LoginResponse> login(@Body LoginRequest request);
    // POST pour l'inscription du patient
    @POST("inscription_patient")
    Call<ResponseBody> inscrirePatient(@Body RequestBody body);

    // PUT modifie les informations des patients
    @PUT("modifier_patient")
    Call<Void> updatePatient(@Body Map<String, String> data);
    // PUT pour changer le mot de passe
    @PUT("mdp_put")
    Call<ResponseBody> changerMotDePasse(@Body Map<String, String> data);
    // PUT annulation de rendezVous
    @PUT("rendezVous/id/patient/{numRdv}")
    Call<Void> putAnnulerRdv(
            @Path("numRdv") int numRdv,
            @Body Map<String, String> body);



    //GET recevoir pour filtrer selon les codes des employé
    @GET("employees/{id_service}")
    Call <List<FiltrePersonnelRequest>> getCodeEmploye (@Path("id_service") int idService) ;
    // GET pour filtrer selon la date

    @GET("disponibilitees/employe/id/{code_employe}")
    Call<List<FiltreDateRequest>> getDate(@Path("code_employe") int codeEmploye);

    //GET pour filtrer selon l'heure
    @GET("disponibilite/employe/{code_employe}/{jour}")
    Call<List<FiltreHeureRequest>> getHeure(
            @Path("code_employe") int codeEmploye,
            @Path("jour") String jour
    );
}




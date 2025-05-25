package edu.ucsb.cs156.rec.controllers;

import edu.ucsb.cs156.rec.entities.User;
import edu.ucsb.cs156.rec.entities.RecommendationRequest;
import edu.ucsb.cs156.rec.repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.ucsb.cs156.rec.ControllerTestCase;
import edu.ucsb.cs156.rec.repositories.RecommendationRequestRepository;
import edu.ucsb.cs156.rec.testconfig.TestConfig;
import joptsimple.internal.OptionNameMap;

import java.util.List;
import java.util.Map;

import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
@WebMvcTest(controllers = RecommendationRequestController.class)
@Import(TestConfig.class)
public class RecommendationRequestControllerTest extends ControllerTestCase {
    @MockBean
    RecommendationRequestRepository recommendationRequestRepository;

    @MockBean
    UserRepository userRepository;

    private static User buildProfessor(String email, String googleSub, String fullName, String givenName, String familyName, Long id) {
        return User.builder()
                    .id(id)
                    .email(email)
                    .googleSub(googleSub)
                    .fullName(fullName)
                    .givenName(givenName)
                    .familyName(familyName)
                    .emailVerified(true)
                    .professor(true)
                    .build();
    }

    private static RecommendationRequest buildRecommendationRequest(Long id, User requester, User professor, String recommendationType, String details, String status, String dueDate, String submissionDate, String lastModifiedDate, String completionDate) {
        return RecommendationRequest.builder()
                    .id(id)
                    .requester(requester)
                    .professor(professor)
                    .recommendationType(recommendationType)
                    .details(details)
                    .status(status)
                    .dueDate(LocalDateTime.parse(dueDate))
                    .submissionDate(LocalDateTime.parse(submissionDate))
                    .lastModifiedDate(LocalDateTime.parse(lastModifiedDate))
                    .completionDate(completionDate != null ? LocalDateTime.parse(completionDate) : null)
                    .build();
    }

    //User can delete their own recommendation request
    @WithMockUser(roles = { "USER" })
    @Test
    public void  user_can_delete_their_recommendation_request() throws Exception {

        User user = currentUserService.getCurrentUser().getUser(); 
        User prof = buildProfessor("profA@ucsb.edu", "googleSub", "Prof A", "Prof", "A", 22L);
        
        // arrange
        RecommendationRequest recReq = buildRecommendationRequest(15L, user, prof, "PhDprogram", "details", "PENDING", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", null);

        when(recommendationRequestRepository.findByIdAndRequester(eq(15L), eq(user))).thenReturn(Optional.of(recReq));

        // act
        MvcResult response = mockMvc.perform(
                delete("/api/recommendationrequest?id=15")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findByIdAndRequester(15L, user);
        verify(recommendationRequestRepository, times(1)).delete(recReq);

        Map<String, Object> json = responseToJson(response);
        assertEquals("RecommendationRequest with id 15 deleted", json.get("message"));
    }
    
    //user attempts to delete a recommendation request that dne
    @WithMockUser(roles = { "USER"})
    @Test
    public void user_tries_to_delete_non_existant_recommendation_request_and_gets_right_error_message()
            throws Exception {
        // arrange
        User user1 = currentUserService.getCurrentUser().getUser(); 
        User user2 = User.builder().id(44).build(); 
        User prof = buildProfessor("profA@ucsb.edu", "googleSub", "Prof A", "Prof", "A", 22L);

        RecommendationRequest rec1 = buildRecommendationRequest(15L, user1, prof, "PhDprogram", "details", "PENDING", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00");
                
        when(recommendationRequestRepository.findByIdAndRequester(eq(15L),eq(user2))).thenReturn(Optional.of(rec1));

        // act
        MvcResult response = mockMvc.perform(
                delete("/api/recommendationrequest?id=15")
                        .with(csrf()))
                .andExpect(status().isNotFound()).andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findByIdAndRequester(15L, user1);
        Map<String, Object> json = responseToJson(response);
        assertEquals("RecommendationRequest with id 15 not found", json.get("message"));
    }

    //User can't delete another user's recommendation request
    @WithMockUser(roles = { "USER" })
    @Test
    public void user_can_not_delete_belonging_to_another_user()
        throws Exception {

        User user1 = currentUserService.getCurrentUser().getUser();
        User user2 = User.builder().id(44).build();
        User prof = buildProfessor("profA@ucsb.edu", "googleSub", "Prof A", "Prof", "A", 22L);
        RecommendationRequest rec1 = buildRecommendationRequest(67L, user2, prof, "PhDprogram", "details", "PENDING", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00");

        when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(rec1));

        // act
        MvcResult response = mockMvc.perform(
                delete("/api/recommendationrequest?id=67")
                        .with(csrf()))
                .andExpect(status().isNotFound()).andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findByIdAndRequester(67L, user1);
        Map<String, Object> json = responseToJson(response);
        assertEquals("RecommendationRequest with id 67 not found", json.get("message"));
    }

    //Admin can delete a recommendation request
    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_can_delete_recommendation_request() throws Exception {
        // arrange

        User user2 = User.builder().id(44).build(); 
        User prof = buildProfessor("profA@ucsb.edu", "googleSub", "Prof A", "Prof", "A", 22L);
        RecommendationRequest rec1 = buildRecommendationRequest(67L, user2, prof, "PhDprogram", "details", "PENDING", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00");

        when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(rec1));
        // act
        MvcResult response = mockMvc.perform(
                delete("/api/recommendationrequest/admin?id=67")
                        .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findById(67L);
        verify(recommendationRequestRepository, times(1)).delete(any());
        Map<String, Object> json = responseToJson(response);
        assertEquals("RecommendationRequest with id 67 deleted", json.get("message"));

    }

    //Admin can't delete a recommendation request that dne
    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_can_not_delete_recommendation_request_that_does_not_exist() throws Exception {
        // arrange

        when(recommendationRequestRepository.findById(eq(19L))).thenReturn(Optional.empty()); 

        // act
        MvcResult response = mockMvc.perform(
                delete("/api/recommendationrequest/admin?id=19")
                        .with(csrf()))
                .andExpect(status().isNotFound()).andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findById(19L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("RecommendationRequest with id 19 not found", json.get("message"));
    }
    
    //User can update their recommendation request
    @WithMockUser(roles = { "USER" })
    @Test
    public void user_logged_in_put_recommendation_request() throws Exception {
        User user1 = currentUserService.getCurrentUser().getUser(); 
        User prof1 = buildProfessor("profA@ucsb.edu", "googleSub", "Prof A", "Prof", "A", 22L);
        RecommendationRequest rec = buildRecommendationRequest(63L, user1, prof1, "PhDprogram", "details", "PENDING", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00");
        RecommendationRequest rec_updated = buildRecommendationRequest(63L, user1, prof1, "PhDprogram", "more details", "PENDING", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00");
        RecommendationRequest rec_corrected = buildRecommendationRequest(63L, user1, prof1, "PhDprogram", "more details", "PENDING", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00");              
        
        String requestBody = mapper.writeValueAsString(rec_updated); 
        String expectedReturn = mapper.writeValueAsString(rec_corrected); 

        when(recommendationRequestRepository.findByIdAndRequester(eq(63L), eq(user1))).thenReturn(Optional.of(rec)); 

        // act
        MvcResult response = mockMvc
                .perform(put("/api/recommendationrequest?id=63")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findByIdAndRequester(63L, user1);
        verify(recommendationRequestRepository, times(1))
                .save(rec_corrected); 
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedReturn, responseString);
    }

    //User can't edit a recommendation request that dne
    @WithMockUser(roles = { "USER" })
    @Test
    public void user_can_not_put_recommendation_request_that_does_not_exist() throws Exception {

        User user1 = currentUserService.getCurrentUser().getUser(); 

        User prof = buildProfessor("profA@ucsb.edu", "googleSub", "Prof A", "Prof", "A", 22L);
        RecommendationRequest rec = buildRecommendationRequest(67L, user1, prof, "PhDprogram", "details", "PENDING", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00");

        String requestBody = mapper.writeValueAsString(rec); 
        when(recommendationRequestRepository.findByIdAndRequester(eq(67L), eq(user1))).thenReturn(Optional.empty());

        // act
        MvcResult response = mockMvc
                .perform(put("/api/recommendationrequest?id=67")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();
        // assert
        verify(recommendationRequestRepository, times(1)).findByIdAndRequester(67L, user1);
        Map<String, Object> output = responseToJson(response);
        assertEquals("RecommendationRequest with id 67 not found", output.get("message"));
    }

    //User can't edit a recommendation request for another user
    @WithMockUser(roles = { "USER" })
    @Test
    public void user_can_not_put_recommendation_request_for_another_user() throws Exception {
        User user1 = currentUserService.getCurrentUser().getUser(); 
        User user2 = User.builder().id(44).build(); 
        User prof = buildProfessor("profA@ucsb.edu", "googleSub", "Prof A", "Prof", "A", 22L);
        RecommendationRequest rec = buildRecommendationRequest(67L, user2, prof, "PhDprogram", "details", "PENDING", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00");

        RecommendationRequest rec_updated = buildRecommendationRequest(67L, user1, prof, "PhDprogram", "more details", "PENDING", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00");

        when(recommendationRequestRepository.findByIdAndRequester(eq(31L), eq(user2)))
        .thenReturn(Optional.of(rec));

        String requestBody = mapper.writeValueAsString(rec_updated);

         // act
        MvcResult response = mockMvc
                .perform(put("/api/recommendationrequest?id=67")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();

        
        // assert
        verify(recommendationRequestRepository, times(1)).findByIdAndRequester(67, user1);
        Map<String, Object> json = responseToJson(response);
        assertEquals("EntityNotFoundException", json.get("type"));
        assertEquals("RecommendationRequest with id 67 not found", json.get("message"));
    }

    //Prof can edit a Recommendation Request
    @WithMockUser(roles = {"PROFESSOR"})
    @Test
    public void prof_can_put_recommendation_request() throws Exception {
        //arrange
        User student = User.builder().id(99).build(); 
        User prof = buildProfessor("profA@ucsb.edu", "googleSub", "Prof A", "Prof", "A", 22L);

        RecommendationRequest rec = buildRecommendationRequest(67L, student, prof, "PhDprogram", "details", "PENDING", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00");

        RecommendationRequest rec_updated = buildRecommendationRequest(67L, student, prof, "PhDprogram", "details", "COMPLETED", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00");

        String requestBody = mapper.writeValueAsString(rec_updated);

        when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(rec));
        when(recommendationRequestRepository.save(any(RecommendationRequest.class))).thenReturn(rec_updated);

        //act
        MvcResult response = mockMvc
                .perform(put("/api/recommendationrequest/professor?id=67")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        //assert
        verify(recommendationRequestRepository, times(1)).findById(67L);
        verify(recommendationRequestRepository, times(1)).save(any(RecommendationRequest.class));

        String responseString = response.getResponse().getContentAsString();
        RecommendationRequest savedRequest = mapper.readValue(responseString, RecommendationRequest.class);
        
        // check that status was updated
        assertEquals("COMPLETED", savedRequest.getStatus());
        
        // check that completion date was set
        assertNotNull(savedRequest.getCompletionDate());
        
        // check that completion date is recent
        LocalDateTime now = LocalDateTime.now();
        assertTrue(savedRequest.getCompletionDate().isAfter(now.minusSeconds(5)));
        assertTrue(savedRequest.getCompletionDate().isBefore(now.plusSeconds(5)));
    }


    //prof can not edit a Recommendation Request that dne
    @WithMockUser(roles = {"PROFESSOR"})
    @Test
    public void prof_can_not_put_recommendation_request_that_does_not_exist() throws Exception {
        //arrange
        User user2 = User.builder().id(200).build(); 
        User prof = buildProfessor("profA@ucsb.edu", "googleSub", "Prof A", "Prof", "A", 22L);

        RecommendationRequest rec_updated = buildRecommendationRequest(67L, user2, prof, "PhDprogram", "details", "COMPLETED", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00");

        String requestBody = mapper.writeValueAsString(rec_updated);

        when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.empty());

        //act 
        MvcResult response = mockMvc
                .perform(put("/api/recommendationrequest/professor?id=67")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();
        
        //assert
        verify(recommendationRequestRepository, times(1)).findById(67L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("EntityNotFoundException", json.get("type"));
        assertEquals("RecommendationRequest with id 67 not found", json.get("message"));
    }

    @WithMockUser(roles = {"PROFESSOR"})
    @Test
    public void prof_can_deny_request_and_sets_date() throws Exception {

        // arrange
        User prof = currentUserService.getCurrentUser().getUser();
        User student = User.builder().id(99).build();

        RecommendationRequest rec = RecommendationRequest.builder()
            .id(1L)
            .requester(student)
            .professor(prof)
            .recommendationType("PhDprogram")
            .details("test details")
            .status("PENDING")
            .build();

        RecommendationRequest rec_updated = RecommendationRequest.builder()
            .id(1L)
            .requester(student)
            .professor(prof)
            .recommendationType("PhDprogram")
            .details("test details")
            .status("DENIED")
            .build();

        when(recommendationRequestRepository.findById(eq(1L))).thenReturn(Optional.of(rec));

        when(recommendationRequestRepository.save(any(RecommendationRequest.class))).thenAnswer(new Answer<RecommendationRequest>() {
            @Override
            public RecommendationRequest answer(InvocationOnMock invocation) throws Throwable {
                RecommendationRequest saved = (RecommendationRequest) invocation.getArguments()[0];
                return saved;
            }
        });

        // act
        MvcResult response = mockMvc.perform(put("/api/recommendationrequest/professor?id=1")
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(rec_updated))
            .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findById(1L);
        verify(recommendationRequestRepository, times(1)).save(any(RecommendationRequest.class));

        String responseString = response.getResponse().getContentAsString();
        RecommendationRequest savedRequest = mapper.readValue(responseString, RecommendationRequest.class);

        assertEquals("DENIED", savedRequest.getStatus());
        assertNotNull(savedRequest.getCompletionDate());

        LocalDateTime now = LocalDateTime.now();
        assertTrue(savedRequest.getCompletionDate().isAfter(now.minusSeconds(5)));
        assertTrue(savedRequest.getCompletionDate().isBefore(now.plusSeconds(5)));

    }

    @WithMockUser(roles = {"PROFESSOR"})
    @Test
    public void prof_doesnt_update_status_and_completion_date_should_not_update() throws Exception {
        // arrange
        User prof = currentUserService.getCurrentUser().getUser();
        User student = User.builder().id(99).build();

        RecommendationRequest rec = RecommendationRequest.builder()
            .id(1L)
            .requester(student)
            .professor(prof)
            .recommendationType("PhDprogram")
            .details("test details")
            .status("PENDING")
            .completionDate(null)
            .build();

        RecommendationRequest rec_updated = RecommendationRequest.builder()
            .id(1L)
            .requester(student)
            .professor(prof)
            .recommendationType("PhDprogram")
            .details("test details")
            .status("PENDING") 
            .completionDate(null)
            .build();

        when(recommendationRequestRepository.findById(eq(1L))).thenReturn(Optional.of(rec));
        when(recommendationRequestRepository.save(any(RecommendationRequest.class))).thenAnswer(new Answer<RecommendationRequest>() {
            @Override
            public RecommendationRequest answer(InvocationOnMock invocation) throws Throwable {
                RecommendationRequest saved = (RecommendationRequest) invocation.getArguments()[0];
                return saved;
            }
        });

        // act
        MvcResult response = mockMvc.perform(put("/api/recommendationrequest/professor?id=1")
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(rec_updated))
            .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findById(1L);
        verify(recommendationRequestRepository, times(1)).save(any(RecommendationRequest.class));

        String responseString = response.getResponse().getContentAsString();
        RecommendationRequest savedRequest = mapper.readValue(responseString, RecommendationRequest.class);
        
        assertEquals("PENDING", savedRequest.getStatus());
        assertNull(savedRequest.getCompletionDate());
    }

       // professor can change status of recommendation request from completed back to pending, causing completion date to be set to null
       @WithMockUser(roles = {"PROFESSOR"})
       @Test
       public void prof_can_put_recommendation_request_back_to_pending_completion_date_sets_to_null() throws Exception {
        //arrange
        User student = User.builder().id(99).build(); 
        User prof = buildProfessor("profA@ucsb.edu", "googleSub", "Prof A", "Prof", "A", 22L);
        
        RecommendationRequest rec = buildRecommendationRequest(67L, student, prof, "PhDprogram", "details", "COMPLETED", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00");
        RecommendationRequest rec_updated = buildRecommendationRequest(67L, student, prof, "PhDprogram", "details", "PENDING", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", null);

        String requestBody = mapper.writeValueAsString(rec_updated);

        when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(rec));
        when(recommendationRequestRepository.save(any(RecommendationRequest.class))).thenReturn(rec_updated);

        //act
        MvcResult response = mockMvc
                .perform(put("/api/recommendationrequest/professor?id=67")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();
        //assert
        verify(recommendationRequestRepository, times(1)).findById(67L);
        verify(recommendationRequestRepository, times(1)).save(any(RecommendationRequest.class));

        String responseString = response.getResponse().getContentAsString();
        RecommendationRequest savedRequest = mapper.readValue(responseString, RecommendationRequest.class);

        // check that completion date was set to null
        assertNull(savedRequest.getCompletionDate());
        }
  
  
    //Admin can get all requests
    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void admin_can_get_all_requests() throws Exception {
        //arrange
        User user1 = User.builder().id(111).build();
        User user2 = User.builder().id(112).build();
        User user3 = User.builder().id(113).build();

        User prof = User.builder()
                .id(156)
                .email("phtcon@ucsb.edu")
                .googleSub("googleSub")
                .fullName("Phill Conrad")
                .givenName("Phill")
                .familyName("Conrad")
                .emailVerified(true)
                .professor(true)
                .build();

        RecommendationRequest rec_111 = RecommendationRequest.builder()
                .id(101)
                .requester(user1)
                .professor(prof)
                .recommendationType("BSMS")
                .details("hi!")
                .status("COMPLETED")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();
        RecommendationRequest rec_112 = RecommendationRequest.builder()
                .id(102)
                .requester(user2)
                .professor(prof)
                .recommendationType("BSMS")
                .details("hi!")
                .status("COMPLETED")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();
        RecommendationRequest rec_113 = RecommendationRequest.builder()
                .id(103)
                .requester(user3)
                .professor(prof)
                .recommendationType("BSMS")
                .details("hi!")
                .status("COMPLETED")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();
        
        String requestBody = "";
        when(recommendationRequestRepository.findAll()).thenReturn(List.of(rec_111, rec_112, rec_113));
        //act 
        MvcResult response = mockMvc
                .perform(get("/api/recommendationrequest/admin/all")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        String content = response.getResponse().getContentAsString();

        String expectedJson1 = mapper.writeValueAsString(rec_111);
        String expectedJson2 = mapper.writeValueAsString(rec_112);
        String expectedJson3 = mapper.writeValueAsString(rec_113);

        String expectedJson = "[" + expectedJson1 + "," + expectedJson2 + "," + expectedJson3 + "]";


        // Assert that the contents match
        assertEquals(content, expectedJson);

    }

    //Non-Admin can't get all requests
    @WithMockUser(roles = {"PROFESSOR"})
    @Test
    public void non_admin_cannot_get_all_requests() throws Exception {
        //arrange
        User user1 = User.builder().id(111).build();
        User user2 = User.builder().id(112).build();
        User user3 = User.builder().id(113).build();

        User prof = User.builder()
                .id(156)
                .email("phtcon@ucsb.edu")
                .googleSub("googleSub")
                .fullName("Phill Conrad")
                .givenName("Phill")
                .familyName("Conrad")
                .emailVerified(true)
                .professor(true)
                .build();

        RecommendationRequest rec_111 = RecommendationRequest.builder()
                .id(101)
                .requester(user1)
                .professor(prof)
                .recommendationType("BSMS")
                .details("hi!")
                .status("COMPLETED")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();
        RecommendationRequest rec_112 = RecommendationRequest.builder()
                .id(102)
                .requester(user2)
                .professor(prof)
                .recommendationType("BSMS")
                .details("hi!")
                .status("COMPLETED")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();
        RecommendationRequest rec_113 = RecommendationRequest.builder()
                .id(103)
                .requester(user3)
                .professor(prof)
                .recommendationType("BSMS")
                .details("hi!")
                .status("COMPLETED")
                .completionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .dueDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .submissionDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .lastModifiedDate(LocalDateTime.parse("2022-01-03T00:00:00"))
                .build();
        
        String requestBody = "";
        when(recommendationRequestRepository.findAll()).thenReturn(List.of(rec_111, rec_112, rec_113));
        //act 
        MvcResult response = mockMvc
                .perform(get("/api/recommendationrequest/admin/all")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
                .andExpect(status().isForbidden())
                .andReturn();
    }
          
       // professor can change status of recommendation request from completed back to accepted (within pending page), causing completion date to be set to null
       @WithMockUser(roles = {"PROFESSOR"})
       @Test
       public void prof_can_put_recommendation_request_back_to_pending_completion_date_sets_to_null_2() throws Exception {
        //arrange
        User student = User.builder().id(99).build(); 
        User prof = buildProfessor("profA@ucsb.edu", "googleSub", "Prof A", "Prof", "A", 22L);
        
        RecommendationRequest rec = buildRecommendationRequest(67L, student, prof, "PhDprogram", "details", "COMPLETED", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00");

        RecommendationRequest rec_updated = buildRecommendationRequest(67L, student, prof, "PhDprogram", "details", "ACCEPTED", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", null);

        String requestBody = mapper.writeValueAsString(rec_updated);

        when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(rec));
        when(recommendationRequestRepository.save(any(RecommendationRequest.class))).thenReturn(rec_updated);

        //act
        MvcResult response = mockMvc
                .perform(put("/api/recommendationrequest/professor?id=67")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        //assert
        verify(recommendationRequestRepository, times(1)).findById(67L);
        verify(recommendationRequestRepository, times(1)).save(any(RecommendationRequest.class));

        String responseString = response.getResponse().getContentAsString();
        RecommendationRequest savedRequest = mapper.readValue(responseString, RecommendationRequest.class);

        // check that completion date was set to null
        assertNull(savedRequest.getCompletionDate());
         
       }

       // professor can change status of recommendation request from Denied back to Accepted (within pending page), causing completion date to be set to null
       @WithMockUser(roles = {"PROFESSOR"})
       @Test
       public void prof_can_put_recommendation_request_from_denied_to_accepted_status() throws Exception {
        //arrange
        User student = User.builder().id(99).build(); 
        User prof = buildProfessor("profA@ucsb.edu", "googleSub", "Prof A", "Prof", "A", 22L);
        
        RecommendationRequest rec = buildRecommendationRequest(67L, student, prof, "PhDprogram", "details", "PENDING", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", null);

        RecommendationRequest rec_updated = buildRecommendationRequest(67L, student, prof, "PhDprogram", "details", "DENIED", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00");

        String requestBody = mapper.writeValueAsString(rec_updated);

        when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(rec));
        when(recommendationRequestRepository.save(any(RecommendationRequest.class))).thenReturn(rec_updated);

        //act
        MvcResult response = mockMvc
                .perform(put("/api/recommendationrequest/professor?id=67")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        //assert
        verify(recommendationRequestRepository, times(1)).findById(67L);
        verify(recommendationRequestRepository, times(1)).save(any(RecommendationRequest.class));

        String responseString = response.getResponse().getContentAsString();
        RecommendationRequest savedRequest = mapper.readValue(responseString, RecommendationRequest.class);

        assertEquals("DENIED", savedRequest.getStatus());
        // check that completion date was set to null
        assertNotNull(savedRequest.getCompletionDate());
       }

        // professor cannot update status to invalid status
        @WithMockUser(roles = {"PROFESSOR"})
        @Test
        public void prof_cannot_update_status_to_invalid_status() throws Exception {
            //arrange
            User student = User.builder().id(99).build(); 
            User prof = buildProfessor("profA@ucsb.edu", "googleSub", "Prof A", "Prof", "A", 22L);
            
            RecommendationRequest rec = buildRecommendationRequest(67L, student, prof, "PhDprogram", "details", "PENDING", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", null);
            RecommendationRequest rec_updated = buildRecommendationRequest(67L, student, prof, "PhDprogram", "details", "INVALID", "2022-01-03T00:00:00", "2022-01-03T00:00:00", "2022-01-03T00:00:00", null);

            String requestBody = mapper.writeValueAsString(rec_updated);

            when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(rec));

            //act
            MvcResult response = mockMvc
                    .perform(put("/api/recommendationrequest/professor?id=67")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
                    .andExpect(status().isBadRequest())
                    .andReturn();

            //assert
            verify(recommendationRequestRepository, times(1)).findById(67L);
            verify(recommendationRequestRepository, times(0)).save(any(RecommendationRequest.class));

            Map<String, Object> json = responseToJson(response);
            assertEquals("IllegalArgumentException", json.get("type"));
            assertEquals("Unknown Request Status: INVALID", json.get("message"));
        }
}

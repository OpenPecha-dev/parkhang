from django.conf.urls import url, include

from .views import UserDetail, UserSettings, SourceList, TextList, TextDetail, TextSearch, WitnessList, AnnotationList, AnnotationDetail, UserAnnotationOperations, UserAnnotationOperationDetail, QuestionList, QuestionDetail

urlpatterns = [
    url(r'users/(?P<user_id>[0-9]+)/?$', UserDetail.as_view()),
    url(r'users/(?P<user_id>[0-9]+)/settings/?$', UserSettings.as_view()),
    url(r'sources/$', SourceList.as_view()),
    url(r'texts/search/(?P<search_term>[^/]+)/?$', TextSearch.as_view()),
    url(r'texts/search/text/(?P<text_id>[0-9]+)/(?P<search_term>[^/]+)$', TextSearch.as_view()),
    url(r'texts/$', TextList.as_view()),
    url(r'texts/(?P<text_id>[0-9]+)/?$', TextDetail.as_view()),
    url(r'texts/(?P<text_id>[0-9]+)/witnesses/$', WitnessList.as_view()),
    url(r'texts/(?P<text_id>[0-9]+)/witnesses/(?P<witness_id>[0-9]+)/annotations/$', AnnotationList.as_view()),
    url(r'texts/(?P<text_id>[0-9]+)/witnesses/(?P<witness_id>[0-9]+)/annotations/(?P<start>[0-9]+),(?P<length>[0-9]+)$', AnnotationList.as_view()),
    url(r'texts/(?P<text_id>[0-9]+)/witnesses/(?P<witness_id>[0-9]+)/annotations/(?P<annotation_unique_id>.+)$', AnnotationDetail.as_view()),
    url(r'texts/[0-9]+/witnesses/(?P<witness_id>[0-9]+)/questions/(?P<start>[0-9]+)-(?P<length>[0-9]+)$', QuestionList.as_view()),
    url(r'texts/[0-9]+/witnesses/[0-9]+/questions/id/(?P<annotation_id>.+)$', QuestionDetail.as_view()),
    url(r'texts/[0-9]+/witnesses/(?P<witness_id>[0-9]+)/applied_annotations/$', UserAnnotationOperations.as_view()),
    url(r'texts/[0-9]+/witnesses/(?P<witness_id>[0-9]+)/applied_annotations/(?P<annotation_unique_id>.+)$', UserAnnotationOperationDetail.as_view()),
    url(r'texts/[0-9]+/witnesses/(?P<witness_id>[0-9]+)/user_annotation_operations/$', UserAnnotationOperations.as_view()),
    url(r'texts/[0-9]+/witnesses/(?P<witness_id>[0-9]+)/user_annotation_operations/(?P<annotation_unique_id>.+)$', UserAnnotationOperationDetail.as_view())
    
    ]


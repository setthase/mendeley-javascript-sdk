define(function(require) {

    'use strict';

    require('es5-shim');

    describe('annotations api', function() {

        var api = require('api');
        var annotationsApi = api.annotations;
        var baseUrl = 'https://api.mendeley.com';

        var mockAuth = require('mocks/auth');
        api.setAuthFlow(mockAuth.mockImplicitGrantFlow());

        describe('list method', function() {

            var ajaxSpy;
            var ajaxRequest;
            var params = {
                limit: 500
            };

            it('be defined', function() {
                expect(typeof annotationsApi.list).toBe('function');
                ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());

                annotationsApi.list(params);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
            });

            it('should use endpoint /annotations/', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/annotations/');
            });

            it('should NOT have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should apply request params', function() {
                expect(ajaxRequest.data).toEqual(params);
            });
        });

        describe('retrieve method', function() {

            var ajaxSpy;
            var ajaxRequest;

            it('should be defined', function() {
                expect(typeof annotationsApi.retrieve).toBe('function');
                ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());
                annotationsApi.retrieve(123);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
            });

            it('should use endpoint /annotations/{id}', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/annotations/123');
            });

            it('should NOT have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should NOT have a body', function() {
                expect(ajaxRequest.data).toBeUndefined();
            });
        });

        describe('retrieveByDocumentId method', function() {

            var ajaxSpy;
            var ajaxRequest;

            it('should be defined', function() {
                expect(typeof annotationsApi.retrieveByDocumentId).toBe('function');
                ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());
                annotationsApi.retrieveByDocumentId(123);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
            });

            it('should use endpoint /annotations?document_id={id}', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/annotations?document_id=123');
            });

            it('should NOT have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should NOT have a body', function() {
                expect(ajaxRequest.data).toBeUndefined();
            });
        });

        describe('retrieveByDocIdAndType method', function() {

            var ajaxSpy;
            var ajaxRequest;

            it('should be defined', function() {
                expect(typeof annotationsApi.retrieveByDocIdAndType).toBe('function');
                ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());
                annotationsApi.retrieveByDocIdAndType('note', 123);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
            });

            it('should use endpoint /annotations?type={type}&document_id={id}', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/annotations?type=note&document_id=123');
            });

            it('should NOT have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should NOT have a body', function() {
                expect(ajaxRequest.data).toBeUndefined();
            });
        });

        describe('pagination', function() {

            var sendMendeleyCountHeader = true,
            groupCount = 56,
            sendLinks = true,
            linkNext = baseUrl + '/annotations/?limit=5&reverse=false&marker=03726a18-140d-3e79-9c2f-b63473668359',
            linkLast = baseUrl + '/annotations/?limit=5&reverse=true';

            function ajaxSpy() {
                return spyOn($, 'ajax').and.returnValue($.Deferred().resolve([], 'success', {
                    getResponseHeader: function(headerName) {
                        if (headerName === 'Link' && sendLinks) {
                            return ['<' + linkNext + '>; rel="next"', '<' + linkLast + '>; rel="last"'].join(', ');
                        } else if (headerName === 'Mendeley-Count' && sendMendeleyCountHeader) {
                            return groupCount.toString();
                        }

                        return null;
                    },
                    getAllResponseHeaders: function() {
                        return ['Link: <' + linkNext + '>; rel="next"', 'Link: <' + linkLast + '>; rel="last"'].join('\n');
                    }
                }));
            }

            it('should parse link headers', function() {
                ajaxSpy();
                annotationsApi.paginationLinks.next = 'nonsense';
                annotationsApi.paginationLinks.prev = 'nonsense';
                annotationsApi.paginationLinks.last = 'nonsense';

                annotationsApi.list();

                expect(annotationsApi.paginationLinks.next).toEqual(linkNext);
                expect(annotationsApi.paginationLinks.last).toEqual(linkLast);
                expect(annotationsApi.paginationLinks.prev).toEqual(false);
            });

            it('should get correct link on nextPage()', function() {
                var spy = ajaxSpy();
                annotationsApi.nextPage();
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkNext);
            });

            it('should get correct link on lastPage()', function() {
                var spy = ajaxSpy();
                annotationsApi.lastPage();
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkLast);
            });

            it('should fail if no link for rel', function() {
                var spy = ajaxSpy();
                var result = annotationsApi.previousPage();
                expect(result.state()).toEqual('rejected');
                expect(spy).not.toHaveBeenCalled();
            });

            it('should store the total document count', function() {
                ajaxSpy();
                annotationsApi.list();
                expect(annotationsApi.count).toEqual(56);

                sendMendeleyCountHeader = false;
                groupCount = 999;
                annotationsApi.list();
                expect(annotationsApi.count).toEqual(56);

                sendMendeleyCountHeader = true;
                groupCount = 0;
                annotationsApi.list();
                expect(annotationsApi.count).toEqual(0);
            });

            it('should not break when you GET something else that does not have pagination links', function() {

                ajaxSpy();

                annotationsApi.list();

                expect(annotationsApi.paginationLinks.next).toEqual(linkNext);
                expect(annotationsApi.paginationLinks.last).toEqual(linkLast);
                expect(annotationsApi.paginationLinks.prev).toEqual(false);

                sendLinks = false;
                annotationsApi.retrieve(56);
                expect(annotationsApi.paginationLinks.next).toEqual(linkNext);
                expect(annotationsApi.paginationLinks.last).toEqual(linkLast);
                expect(annotationsApi.paginationLinks.prev).toEqual(false);

            });
        });
    });
});

// JQuery Approach
$(document).ready(() => {
    $('#formInputDonasi').on('submit', () => {
        let inputName = $('#modalInputName').val().trim();
        let inputDesc = $('#modalInputDesc').val().trim();
        let inputCP = $('#modalInputCP').val().trim();
        let inputURL = $('#modalInputURL').val().trim();

        let inputData = { 
            issuerID: "ADMIN",
            name: inputName, 
            description: inputDesc, 
            contactPerson: inputCP,
            url: inputURL,
            adminApproval: true
        };

        $.ajax({
            type: 'POST',
            url: '/admin/add',
            data: inputData,
            success: (response) => {
                // do something with response

                location.reload();
            }
        });

        return false;
    });


    $('.btn-outline-danger').on('click', (evt) => {
        let id = evt.target.id;

        $.ajax({
            type: 'PUT',
            url: '/admin/detail/' + id,
            data: {
                adminApproval: false
            },
            success: (response) => {
                // do something with response
                location.reload();
            }
        });
    });

    $('.btn-outline-success').on('click', (evt) => {
        // approve
        let id = evt.target.id;

        $.ajax({
            type: 'PUT',
            url: '/admin/detail/' + id,
            data: {
                adminApproval: true
            },
            success: (response) => {
                // do something with response
                location.reload();
            }
        });
    });
});


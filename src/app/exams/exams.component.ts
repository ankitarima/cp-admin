import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-exams',
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.css']
})
export class ExamsComponent implements OnInit {

  config = {
    placeholder: '',
    tabsize: 2,
    height: 600,
    uploadImagePath: '/api/upload',
    toolbar: [
        ['misc', ['codeview', 'undo', 'redo']],
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['font', ['strikethrough', 'superscript', 'subscript']],
        ['fontsize', ['fontname', 'fontsize', 'color']],
        ['para', ['style', 'ul', 'ol', 'paragraph', 'height']],
        ['insert', ['table', 'picture', 'link', 'video', 'hr']]
    ],
    fontNames: ['Helvetica', 'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Roboto', 'Times']
  }

  eform = new FormGroup({
    id: new FormControl(null),
    exam_name: new FormControl('',Validators.required),
    exam_description: new FormControl('',Validators.required),
    exam_details: new FormControl('',Validators.required),
    slug: new FormControl('', Validators.required),
    featured_image: new FormControl('',Validators.required),
    tags: new FormControl('',Validators.required),
    status: new FormControl('draft')

  });

  public isSubmitting = false;
  public path: any;
  public imgSrc = "assets/images/placeholder-image.png";

  public exams = [] as any;
  public slugs = [] as any;

  constructor(
    private db: AngularFirestore
  ) { }

  ngOnInit(): void {

    this.db.collection('exams').snapshotChanges().subscribe((resp)=>{
      this.exams = [];
      this.slugs = [];
      resp.forEach((data:any)=>{
        // console.log(data)
        const review = data.payload.doc.data() as any;
        Object.assign(review,{id: data.payload.doc.id})
        this.exams.push(review);
        this.slugs.push(review.slug);
      })

      // console.log(this.reviews);
      // console.log(this.slugs)
    })
  }

  onFile(event: any){
    // console.log(event.target.value)
    if(event.target.value){
      this.imgSrc = event.target.value;
    }else{
      this.imgSrc = "assets/images/placeholder-image.png";
    }
  }

  onSubmit(){
    this.eform.patchValue({
      slug: this.string_to_slug(this.eform.value.exam_name)
    })
   if(this.eform.invalid){
     console.log(this.eform.value)
     alert('All fields are required');
     return
   }else if (this.eform.value.id == null){
     this.isSubmitting = true;
     const data = this.eform.value;
     delete data.id;
     console.log(this.eform.value);
     if(!this.slugs.includes(this.eform.value.slug )){
       this.db.collection('exams').add(data).then(()=>{
           // this.eform.reset();
           this.isSubmitting = false;
       }).catch((err)=>{
           console.log(err)
       })
     }else{
       alert('Exam with same slug/name already exists')
       this.isSubmitting = false;
     }
   }else if (this.eform.value.id){
       this.isSubmitting = true;

       const data = this.eform.value;
       const id = data.id;
       delete data.id;
       console.log(data)
       this.db.doc('exams/'+id).update(data).then(()=>{
         // this.eform.reset();
         this.isSubmitting = false;
       }).catch((err)=>{
           console.log(err)
       })
   }

  }

  edit(data:any){
    console.log(data);
    this.imgSrc = data.featured_image
    this.eform.patchValue(data)
  }

  publish(data:any){

    console.log(data)
    if(data.status !== 'public'){
      const reviews = [] as any
      this.db.collection('exams').ref.where('slug','==', data.slug).get().then((resp)=>{
        resp.forEach((val:any)=>{
          reviews.push(val.id)
        })
      }).then(()=>{
        if(reviews.length == 1){
          this.db.doc('exams/'+reviews[0]).update({
            status: 'public'
          })
        }else{
          alert('mutliple exams with same name | Contact admin')
        }
      })
    }else if(data.status === 'public'){
     let conf =  confirm('Are you sure to unpublish it ?');
     if(conf == true){
      const reviews = [] as any
      this.db.collection('exams').ref.where('slug','==', data.slug).get().then((resp)=>{
        resp.forEach((val:any)=>{
          reviews.push(val.id)
        })
        console.log(reviews);
      }).then(()=>{
        if(reviews.length == 1){
          this.db.doc('exams/'+reviews[0]).update({
            status: 'draft'
          })
        }else{
          alert('mutliple exams with same name | Contact admin')
        }
      })
     }
    }

  }

  string_to_slug(str) {
    str = str.replace(/^\s+|\s+$/g, ""); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to = "aaaaaaeeeeiiiioooouuuunc------";

    for (var i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
    }

    str = str
      .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
      .replace(/\s+/g, "-") // collapse whitespace and replace by -
      .replace(/-+/g, "-") // collapse dashes
      .replace(/^-+/, "") // trim - from start of text
      .replace(/-+$/, ""); // trim - from end of text

    return str;
  }


}
